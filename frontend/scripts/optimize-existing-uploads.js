#!/usr/bin/env node
/**
 * One-shot script to compress and resize images that were uploaded BEFORE the
 * upload pipeline gained sharp processing (frontend/src/lib/upload.ts).
 *
 * Strategy
 *   - Resize anything wider than MAX_WIDTH down to MAX_WIDTH (no enlarging).
 *   - Re-encode JPEG/PNG/WebP into the same format with a tighter quality,
 *     so the on-disk filename never changes and the database references
 *     stored as `/api/uploads/<filename>.jpg` keep working.
 *   - Skip GIFs (animation), videos, PDFs, and anything already smaller than
 *     SIZE_SKIP_THRESHOLD bytes (already tight enough).
 *
 * Usage
 *   node frontend/scripts/optimize-existing-uploads.js               # do it
 *   node frontend/scripts/optimize-existing-uploads.js --dry         # preview only
 *   UPLOADS_DIR=/var/uploads node frontend/scripts/optimize-existing-uploads.js
 *
 * The script auto-detects the same uploads location lib/upload.ts uses
 * (UPLOADS_DIR env, ./uploads, or ../uploads relative to frontend/).
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Tuning (match frontend/src/lib/upload.ts) ───────────────────────────────
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
const PNG_COMPRESSION = 9;          // 0–9, max
const SIZE_SKIP_THRESHOLD = 250 * 1024; // skip files already < 250 KB

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']); // .gif intentionally excluded

const DRY_RUN = process.argv.includes('--dry') || process.argv.includes('--dry-run');

// ─── Locate uploads dir (mirror lib/upload.ts) ───────────────────────────────
function resolveUploadsDir() {
  const fromEnv = process.env.UPLOADS_DIR;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  // Run from anywhere; resolve relative to this file → frontend/scripts/..
  const here = __dirname;
  const local = path.resolve(here, '..', 'uploads');
  if (fs.existsSync(local)) return local;

  const parent = path.resolve(here, '..', '..', 'uploads');
  if (fs.existsSync(parent)) return parent;

  return null;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function processOne(sharp, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  const originalBytes = stat.size;

  if (originalBytes < SIZE_SKIP_THRESHOLD) {
    return { status: 'skip-small', originalBytes, finalBytes: originalBytes };
  }

  const meta = await sharp(filePath, { failOn: 'none' }).metadata();
  const needsResize = meta.width && meta.width > MAX_WIDTH;
  // Even if no resize needed, recompressing big files is usually worth it.
  // Bail out only if the file is already small AND not too wide.
  if (!needsResize && originalBytes < SIZE_SKIP_THRESHOLD) {
    return { status: 'skip-tight', originalBytes, finalBytes: originalBytes };
  }

  let pipeline = sharp(filePath, { failOn: 'none' });
  if (needsResize) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY });
  } else {
    return { status: 'skip-ext', originalBytes, finalBytes: originalBytes };
  }

  const buf = await pipeline.toBuffer();

  // Don't bother writing if the new file would actually be bigger.
  if (buf.length >= originalBytes) {
    return { status: 'skip-no-gain', originalBytes, finalBytes: originalBytes };
  }

  if (!DRY_RUN) {
    // Atomic-ish: write to a sibling temp file then rename.
    const tmp = filePath + '.tmp-opt';
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, filePath);
  }
  return { status: DRY_RUN ? 'would-shrink' : 'shrunk', originalBytes, finalBytes: buf.length };
}

(async () => {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('sharp is not installed. Run `npm install` inside frontend/ first.');
    process.exit(1);
  }

  const uploadsDir = resolveUploadsDir();
  if (!uploadsDir) {
    console.error('Could not locate uploads directory.');
    console.error('Set UPLOADS_DIR or run from the project root.');
    process.exit(1);
  }

  const entries = fs.readdirSync(uploadsDir);
  const targets = entries.filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()));

  console.log(`Uploads dir : ${uploadsDir}`);
  console.log(`Files found : ${entries.length}  (image candidates: ${targets.length})`);
  console.log(`Mode        : ${DRY_RUN ? 'DRY RUN (no files written)' : 'APPLY'}`);
  console.log('─'.repeat(72));

  const totals = { processed: 0, shrunk: 0, skipped: 0, errors: 0, beforeBytes: 0, afterBytes: 0 };

  for (const name of targets) {
    const filePath = path.join(uploadsDir, name);
    try {
      const result = await processOne(sharp, filePath);
      totals.processed++;
      totals.beforeBytes += result.originalBytes;
      totals.afterBytes += result.finalBytes;

      if (result.status === 'shrunk' || result.status === 'would-shrink') {
        totals.shrunk++;
        const saved = result.originalBytes - result.finalBytes;
        const pct = ((saved / result.originalBytes) * 100).toFixed(1);
        console.log(
          `${result.status === 'would-shrink' ? '~' : '✓'} ${name}  ${formatBytes(result.originalBytes)} → ${formatBytes(result.finalBytes)}  (-${pct}%)`,
        );
      } else {
        totals.skipped++;
      }
    } catch (err) {
      totals.errors++;
      console.warn(`✗ ${name}  ${err && err.message ? err.message : err}`);
    }
  }

  console.log('─'.repeat(72));
  console.log(`Processed   : ${totals.processed}`);
  console.log(`Shrunk      : ${totals.shrunk}`);
  console.log(`Skipped     : ${totals.skipped}`);
  console.log(`Errors      : ${totals.errors}`);
  console.log(`Total bytes : ${formatBytes(totals.beforeBytes)} → ${formatBytes(totals.afterBytes)}`);
  if (totals.beforeBytes > 0) {
    const saved = totals.beforeBytes - totals.afterBytes;
    const pct = ((saved / totals.beforeBytes) * 100).toFixed(1);
    console.log(`Saved       : ${formatBytes(saved)} (-${pct}%)`);
  }
  if (DRY_RUN) {
    console.log('\nDry run only — re-run without --dry to apply.');
  }
})();
