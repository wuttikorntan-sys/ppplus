const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_TOKEN || '';
const LINE_GROUP_ID = process.env.LINE_GROUP_ID || '';

export async function sendLineMessage(message: string): Promise<void> {
  const token = LINE_CHANNEL_TOKEN;
  const groupId = LINE_GROUP_ID;
  if (!token || !groupId) return;

  try {
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
