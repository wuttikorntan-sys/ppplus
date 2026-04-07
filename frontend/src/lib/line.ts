import { db } from '@/lib/db';

export async function sendLineMessage(message: string): Promise<void> {
  try {
    // Read from DB first, fallback to env
    const contents = await db.siteContents.findMany();
    const getVal = (key: string, envKey: string) => {
      const item = contents.find((c) => c.key === key);
      return item?.valueTh || item?.valueEn || process.env[envKey] || '';
    };

    const token = getVal('notify.line.channel.token', 'LINE_CHANNEL_TOKEN');
    const groupId = getVal('notify.line.group.id', 'LINE_GROUP_ID');
    if (!token || !groupId) return;

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [{ type: 'text', text: message }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('LINE push message error:', res.status, err);
    }
  } catch (err) {
    console.error('LINE push message error:', err);
  }
}
