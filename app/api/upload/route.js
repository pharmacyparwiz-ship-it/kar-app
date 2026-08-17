// POST /api/upload
// Accepts a single image file (multipart/form-data, field name "file") and
// saves it to /public/uploads with a randomized filename. Returns the public
// URL to store on a Project record.
//
// Security notes:
// - File content is verified by magic bytes (not just the claimed MIME type
//   or extension), so a renamed executable can't slip through as "image.jpg".
// - Filenames are fully randomized (crypto.randomUUID) — the original
//   filename is never used for the path, preventing path traversal.
// - Rate-limited per IP to prevent storage-filling abuse.
//
// Deployment note: this stores files on local disk, which works for local
// dev and single-server VPS deploys. On serverless hosts (e.g. Vercel) the
// filesystem is not persistent between requests — swap this for an object
// storage service (S3, Cloudflare R2, etc.) before deploying there. See README.

const { NextResponse } = require('next/server');
const { writeFile, mkdir } = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { getUserFromRequest } = require('../../../lib/auth');
const { checkRateLimit } = require('../../../lib/rateLimit');

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Magic-byte signatures for the image types we accept. We check the actual
// file bytes rather than trusting the browser-supplied MIME type.
const SIGNATURES = [
  { ext: '.jpg', mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { ext: '.png', mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: '.gif', mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  // WebP: "RIFF" .... "WEBP" — check both anchors
  { ext: '.webp', mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, secondary: { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 } },
];

function detectImageType(buffer) {
  for (const sig of SIGNATURES) {
    const offset = sig.offset || 0;
    const matches = sig.bytes.every((b, i) => buffer[offset + i] === b);
    if (!matches) continue;
    if (sig.secondary) {
      const secMatches = sig.secondary.bytes.every(
        (b, i) => buffer[sig.secondary.offset + i] === b
      );
      if (!secMatches) continue;
    }
    return sig;
  }
  return null;
}

async function POST(req) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'برای آپلود عکس باید وارد حساب خود شوید' }, { status: 401 });
  }

  const rate = checkRateLimit(req, 'upload', 20, 60 * 10); // 20 uploads / 10 min / IP
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'تعداد آپلود زیاد است. کمی صبر کنید.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'فایلی انتخاب نشده است' }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'حجم عکس نباید بیشتر از ۵ مگابایت باشد' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const detected = detectImageType(buffer);
  if (!detected) {
    return NextResponse.json(
      { error: 'فایل معتبر نیست. فقط عکس (jpg, png, webp, gif) مجاز است.' },
      { status: 400 }
    );
  }

  const filename = `${crypto.randomUUID()}${detected.ext}`;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}

module.exports = { POST };
