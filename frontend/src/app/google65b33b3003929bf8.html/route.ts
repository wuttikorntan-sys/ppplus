export async function GET() {
  return new Response('google-site-verification: google65b33b3003929bf8.html', {
    headers: { 'Content-Type': 'text/html' },
  });
}
