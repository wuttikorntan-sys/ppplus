import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const checks: Record<string, string> = {
    server: 'ok',
    timestamp: new Date().toISOString(),
    env_mysql_host: process.env.MYSQL_HOST ? 'set' : 'NOT SET',
    env_mysql_user: process.env.MYSQL_USER ? 'set' : 'NOT SET',
    env_mysql_db: process.env.MYSQL_DATABASE ? 'set' : 'NOT SET',
  };

  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST ?? 'localhost',
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'ppplus',
    });
    const [rows] = await conn.query('SELECT 1 as ok');
    await conn.end();
    checks.database = 'connected';
    checks.db_user = process.env.MYSQL_USER ?? 'root';
    checks.db_name = process.env.MYSQL_DATABASE ?? 'ppplus';
  } catch (err: unknown) {
    checks.database = 'FAILED';
    checks.db_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(checks);
}
