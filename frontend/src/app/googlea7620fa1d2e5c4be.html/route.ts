export async function GET() {
  return new Response('google-site-verification: googlea7620fa1d2e5c4be.html', {
    headers: { 'Content-Type': 'text/html' },
  });
}
