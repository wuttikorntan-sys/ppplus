import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    // Get SMTP settings from DB, fallback to env
    const contents = await db.siteContents.findMany();
    const get = (key: string, envKey?: string) => {
      const item = contents.find((c) => c.key === key);
      const val = item?.valueTh || item?.valueEn || '';
      if (val) return val;
      return envKey ? (process.env[envKey] || '') : '';
    };

    const smtpHost = get('smtp.host', 'SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(get('smtp.port', 'SMTP_PORT') || '587', 10);
    const smtpUser = get('smtp.user', 'SMTP_USER');
    const smtpPass = get('smtp.pass', 'SMTP_PASS');
    const toEmail = get('smtp.to', 'SMTP_TO');

    if (!smtpUser || !smtpPass || !toEmail) {
      return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : '';
    const safeMessage = escapeHtml(message);

    await transporter.sendMail({
      from: `"PP+ Contact" <${smtpUser}>`,
      replyTo: email,
      to: toEmail,
      subject: `[PP+] ข้อความจาก ${safeName}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:0;">
          <div style="background:#1E3A5F;padding:24px 32px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:20px;">📩 ข้อความใหม่จากเว็บไซต์</h2>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">PP+ - ร้านขายสีครบวงจร</p>
          </div>
          <div style="background:#fff;padding:24px 32px;border:1px solid #eee;border-top:none;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:12px 0;font-weight:600;color:#333;width:100px;vertical-align:top;border-bottom:1px solid #f0f0f0;">ชื่อ</td>
                <td style="padding:12px 0;color:#555;border-bottom:1px solid #f0f0f0;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;font-weight:600;color:#333;vertical-align:top;border-bottom:1px solid #f0f0f0;">อีเมล</td>
                <td style="padding:12px 0;color:#555;border-bottom:1px solid #f0f0f0;"><a href="mailto:${safeEmail}" style="color:#1E3A5F;">${safeEmail}</a></td>
              </tr>
              ${safePhone ? `<tr>
                <td style="padding:12px 0;font-weight:600;color:#333;vertical-align:top;border-bottom:1px solid #f0f0f0;">โทร</td>
                <td style="padding:12px 0;color:#555;border-bottom:1px solid #f0f0f0;"><a href="tel:${safePhone}" style="color:#1E3A5F;">${safePhone}</a></td>
              </tr>` : ''}
            </table>
            <div style="margin-top:20px;padding:16px 20px;background:#f0f7ff;border-radius:10px;border-left:4px solid #1E3A5F;">
              <p style="font-weight:600;color:#333;margin:0 0 8px;font-size:14px;">ข้อความ:</p>
              <p style="color:#555;white-space:pre-wrap;margin:0;line-height:1.6;font-size:14px;">${safeMessage}</p>
            </div>
          </div>
          <div style="background:#f9f9f9;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none;">
            <p style="color:#999;font-size:12px;margin:0;text-align:center;">ส่งจากฟอร์มติดต่อ PP+.co.th</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact email error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
