import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import AdmZip from 'adm-zip';
import { requireAdmin, handleError } from '@/lib/api-server';
import { getUploadsDir } from '@/lib/upload';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.mp4', '.webm'];
const MAX_SIZE = 500 * 1024 * 1024; // 500MB cap

function esc(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  const s = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  return `'${s}'`;
}

async function dumpDatabase(): Promise<string> {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST ?? 'localhost',
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'ppplus',
  });
  try {
    const dbName = process.env.MYSQL_DATABASE ?? 'ppplus';
    const lines: string[] = [];
    lines.push(`-- PP Plus Full Database Backup`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(`-- Database: ${dbName}`);
    lines.push(`-- ============================================\n`);
    lines.push(`SET FOREIGN_KEY_CHECKS = 0;\n`);

    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = (tables as Record<string, string>[]).map((row) => Object.values(row)[0]);

    for (const table of tableNames) {
      const [createResult] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
      const createSQL = (createResult as Record<string, string>[])[0]['Create Table'];
      lines.push(`-- Table: ${table}`);
      lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);
      lines.push(`${createSQL};\n`);

      const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
      const dataRows = rows as Record<string, unknown>[];
      if (dataRows.length > 0) {
        const columns = Object.keys(dataRows[0]);
        const colList = columns.map((c) => `\`${c}\``).join(', ');
        for (const row of dataRows) {
          const vals = columns.map((c) => esc(row[c])).join(', ');
          lines.push(`INSERT INTO \`${table}\` (${colList}) VALUES (${vals});`);
        }
        lines.push('');
      }
    }
    lines.push(`SET FOREIGN_KEY_CHECKS = 1;\n`);
    return lines.join('\n');
  } finally {
    await conn.end();
  }
}

async function applySql(sql: string): Promise<void> {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST ?? 'localhost',
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'ppplus',
    multipleStatements: true,
  });
  try {
    await conn.query(sql);
  } finally {
    await conn.end().catch(() => {});
  }
}

/* ───── GET: download combined backup (database + uploads) as ZIP ───── */
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);

    const sql = await dumpDatabase();
    const uploadsDir = getUploadsDir();

    const zip = new AdmZip();
    zip.addFile('database.sql', Buffer.from(sql, 'utf-8'));

    let imageCount = 0;
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir).filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
      });
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        try {
          const stat = fs.statSync(filePath);
          if (!stat.isFile()) continue;
        } catch { continue; }
        zip.addLocalFile(filePath, 'uploads/');
        imageCount++;
      }
    }

    const manifest = {
      version: 1,
      generatedAt: new Date().toISOString(),
      database: process.env.MYSQL_DATABASE ?? 'ppplus',
      sqlBytes: Buffer.byteLength(sql, 'utf-8'),
      imageCount,
    };
    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8'));

    const buffer = zip.toBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ppplus-full-backup-${timestamp}.zip`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

/* ───── POST: restore from combined ZIP (database + uploads) ───── */
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json({ success: false, error: 'Only .zip files are supported' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: `File too large (max ${MAX_SIZE / (1024 * 1024)}MB)` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const sqlEntry = entries.find((e) => !e.isDirectory && path.basename(e.entryName).toLowerCase() === 'database.sql');
    if (!sqlEntry) {
      return NextResponse.json({ success: false, error: 'database.sql not found in zip — is this a full backup?' }, { status: 400 });
    }

    const uploadEntries = entries.filter((e) => {
      if (e.isDirectory) return false;
      const inUploads = e.entryName.startsWith('uploads/') || e.entryName.includes('/uploads/');
      const ext = path.extname(e.entryName).toLowerCase();
      return inUploads && ALLOWED_EXTENSIONS.includes(ext);
    });

    // Step 1 — restore database. If this fails, abort before touching files.
    const sql = sqlEntry.getData().toString('utf-8');
    if (!sql.trim()) {
      return NextResponse.json({ success: false, error: 'database.sql is empty' }, { status: 400 });
    }
    try {
      await applySql(sql);
    } catch (sqlErr: unknown) {
      const msg = sqlErr instanceof Error ? sqlErr.message : String(sqlErr);
      return NextResponse.json({ success: false, error: `SQL error: ${msg}` }, { status: 400 });
    }

    // Step 2 — restore uploads. SQL is already applied; report image errors as a soft warning.
    const uploadsDir = getUploadsDir();
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    let restoredImages = 0;
    let skippedImages = 0;
    const fileWarnings: string[] = [];
    for (const entry of uploadEntries) {
      const fileName = path.basename(entry.entryName);
      if (!fileName || fileName.includes('..') || fileName.startsWith('.')) {
        skippedImages++;
        continue;
      }
      try {
        fs.writeFileSync(path.join(uploadsDir, fileName), entry.getData());
        restoredImages++;
      } catch (err) {
        skippedImages++;
        fileWarnings.push(`${fileName}: ${err instanceof Error ? err.message : 'write failed'}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Restored database and ${restoredImages} image${restoredImages === 1 ? '' : 's'}${skippedImages > 0 ? ` (skipped ${skippedImages})` : ''}.`,
        sqlBytes: Buffer.byteLength(sql, 'utf-8'),
        restoredImages,
        skippedImages,
        warnings: fileWarnings,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
