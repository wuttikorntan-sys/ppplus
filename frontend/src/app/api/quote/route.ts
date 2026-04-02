import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const cartItemSchema = z.object({
  id: z.number(),
  nameTh: z.string(),
  nameEn: z.string(),
  price: z.number(),
  quantity: z.number(),
  size: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
});

const quoteSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().nullable().default(null),
  company: z.string().nullable().default(null),
  message: z.string().nullable().default(null),
  cartItems: z.array(cartItemSchema).min(1),
});

type CartItemParsed = z.infer<typeof cartItemSchema>;

async function sendEmailNotification(quote: { name: string; phone: string; email: string | null; company: string | null; message: string | null }, items: CartItemParsed[]) {
  try {
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

    if (!smtpUser || !smtpPass || !toEmail) return;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemRows = items.map((item) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">${escapeHtml(item.nameTh)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#555;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#555;text-align:right;">฿${Number(item.price).toLocaleString()}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:right;font-weight:600;">฿${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    ).join('');

    await transporter.sendMail({
      from: `"PP Plus Quote" <${smtpUser}>`,
      replyTo: quote.email || undefined,
      to: toEmail,
      subject: `[PP Plus] ขอใบเสนอราคาจาก ${escapeHtml(quote.name)} (${items.length} รายการ)`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:650px;margin:0 auto;">
          <div style="background:#1C1C1E;padding:24px 32px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:20px;">🛒 ใบขอเสนอราคาใหม่</h2>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">PP Plus - ร้านขายสีครบวงจร</p>
          </div>
          <div style="background:#fff;padding:24px 32px;border:1px solid #eee;border-top:none;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:8px 0;font-weight:600;color:#333;width:100px;">ชื่อ</td><td style="padding:8px 0;color:#555;">${escapeHtml(quote.name)}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;color:#333;">โทร</td><td style="padding:8px 0;color:#555;"><a href="tel:${escapeHtml(quote.phone)}" style="color:#1C1C1E;">${escapeHtml(quote.phone)}</a></td></tr>
              ${quote.email ? `<tr><td style="padding:8px 0;font-weight:600;color:#333;">อีเมล</td><td style="padding:8px 0;color:#555;"><a href="mailto:${escapeHtml(quote.email)}" style="color:#1C1C1E;">${escapeHtml(quote.email)}</a></td></tr>` : ''}
              ${quote.company ? `<tr><td style="padding:8px 0;font-weight:600;color:#333;">บริษัท</td><td style="padding:8px 0;color:#555;">${escapeHtml(quote.company)}</td></tr>` : ''}
            </table>
            <h3 style="font-size:16px;color:#333;margin:0 0 12px;border-bottom:2px solid #F5841F;padding-bottom:8px;">รายการสินค้า</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f9f9f9;">
                  <th style="padding:10px 12px;text-align:left;font-size:13px;color:#666;">สินค้า</th>
                  <th style="padding:10px 12px;text-align:center;font-size:13px;color:#666;">จำนวน</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px;color:#666;">ราคา/ชิ้น</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px;color:#666;">รวม</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
              <tfoot>
                <tr style="background:#FFF5EB;">
                  <td colspan="3" style="padding:12px;text-align:right;font-weight:700;color:#333;">รวมทั้งหมด (ประมาณ)</td>
                  <td style="padding:12px;text-align:right;font-weight:700;color:#F5841F;font-size:16px;">฿${total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            ${quote.message ? `<div style="margin-top:16px;padding:14px 18px;background:#f5f5f5;border-radius:8px;"><p style="margin:0 0 4px;font-weight:600;color:#333;font-size:13px;">ข้อความเพิ่มเติม:</p><p style="margin:0;color:#555;font-size:14px;white-space:pre-wrap;">${escapeHtml(quote.message)}</p></div>` : ''}
          </div>
          <div style="background:#f9f9f9;padding:14px 32px;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none;">
            <p style="color:#999;font-size:12px;margin:0;text-align:center;">ส่งจากระบบขอใบเสนอราคา ppplus.co.th</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Quote email error:', err);
  }
}

async function sendLineNotification(quote: { name: string; phone: string; company: string | null }, items: CartItemParsed[]) {
  try {
    const contents = await db.siteContents.findMany();
    const tokenItem = contents.find((c) => c.key === 'notify.line.token');
    const token = tokenItem?.valueTh || tokenItem?.valueEn || process.env.LINE_NOTIFY_TOKEN || '';
    if (!token) return;

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemList = items.map((i) => `  • ${i.nameTh} x${i.quantity} = ฿${(i.price * i.quantity).toLocaleString()}`).join('\n');

    const message = `\n🛒 ขอใบเสนอราคาใหม่!\n\n👤 ${quote.name}\n📱 ${quote.phone}${quote.company ? `\n🏢 ${quote.company}` : ''}\n\n📦 สินค้า (${items.length} รายการ):\n${itemList}\n\n💰 รวม: ฿${total.toLocaleString()}\n\n🔗 ดูรายละเอียดใน Admin Panel`;

    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    });
  } catch (err) {
    console.error('LINE notify error:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = quoteSchema.parse(body);

    const cartJsonString = JSON.stringify(data.cartItems);
    const firstItem = data.cartItems[0];
    const totalQty = data.cartItems.reduce((s, i) => s + i.quantity, 0);

    const quote = await db.quoteRequests.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      company: data.company,
      productId: firstItem.id,
      productName: data.cartItems.map((i) => `${i.nameTh} x${i.quantity}`).join(', '),
      quantity: String(totalQty),
      message: data.message,
      cartItems: cartJsonString,
    });

    // Send notifications in background (don't block response)
    sendEmailNotification(data, data.cartItems).catch(() => {});
    sendLineNotification(data, data.cartItems).catch(() => {});

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
