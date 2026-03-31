import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { requireAdmin, handleError } from '@/lib/api-server';

/* ───── helper: escape string for SQL ───── */
function esc(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  const s = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  return `'${s}'`;
}

/* ───── GET: export full database as SQL ───── */
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);

    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST ?? 'localhost',
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'ppplus',
    });

    const dbName = process.env.MYSQL_DATABASE ?? 'ppplus';
    const lines: string[] = [];

    lines.push(`-- PP Plus Database Backup`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(`-- Database: ${dbName}`);
    lines.push(`-- ============================================\n`);
    lines.push(`SET FOREIGN_KEY_CHECKS = 0;\n`);

    // Get all tables
    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = (tables as Record<string, string>[]).map((row) => Object.values(row)[0]);

    for (const table of tableNames) {
      // Get CREATE TABLE
      const [createResult] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
      const createSQL = (createResult as Record<string, string>[])[0]['Create Table'];
      lines.push(`-- Table: ${table}`);
      lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);
      lines.push(`${createSQL};\n`);

      // Get rows
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

    await conn.end();

    const sql = lines.join('\n');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ppplus-backup-${timestamp}.sql`;

    return new NextResponse(sql, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
