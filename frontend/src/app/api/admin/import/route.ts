import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { requireAdmin, handleError } from '@/lib/api-server';

/* ───── POST: import SQL file ───── */
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const sql = await file.text();

    if (!sql.trim()) {
      return NextResponse.json({ success: false, error: 'Empty SQL file' }, { status: 400 });
    }

    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST ?? 'localhost',
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'ppplus',
      multipleStatements: true,
    });

    try {
      await conn.query(sql);
      await conn.end();

      return NextResponse.json({
        success: true,
        data: { message: 'SQL imported successfully', fileSize: file.size, fileName: file.name },
      });
    } catch (sqlErr: unknown) {
      await conn.end().catch(() => {});
      const msg = sqlErr instanceof Error ? sqlErr.message : String(sqlErr);
      return NextResponse.json({ success: false, error: `SQL Error: ${msg}` }, { status: 400 });
    }
  } catch (err) {
    return handleError(err);
  }
}
