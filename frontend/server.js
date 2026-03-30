const fs = require('fs');
const path = require('path');

/* ── copy static assets into standalone dir ── */
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const copies = [
  { src: path.join(__dirname, '.next', 'static'), dest: path.join(standaloneDir, '.next', 'static') },
  { src: path.join(__dirname, 'public'),           dest: path.join(standaloneDir, 'public') },
];
for (const { src, dest } of copies) {
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

/* ── start Next.js standalone server ── */
process.env.HOSTNAME = '0.0.0.0';
process.env.PORT = process.env.PORT || '3000';

require(path.join(standaloneDir, 'server.js'));
