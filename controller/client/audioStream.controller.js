const crypto  = require('crypto');
const path    = require('path');
const fs      = require('fs');
const Product = require('../../models/product.model');

const SECRET = process.env.SIGNED_URL_SECRET || 'podcast-secret-key-change-me';

// ── Tạo signed URL
function generateSignedUrl(productId, expiresInSeconds = 7200) {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(`${productId}:${expires}`)
    .digest('hex');
  return `/products/audio/stream/${productId}?expires=${expires}&sig=${sig}`;
}

// ── Verify signed URL
function verifySignedUrl(productId, expires, sig) {
  if (!expires || Date.now() / 1000 > parseInt(expires)) return false;
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`${productId}:${expires}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig,      'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

// ── [GET] /products/audio/stream/:id?expires=...&sig=...
module.exports.stream = async (req, res) => {
  try {
    const { id }           = req.params;
    const { expires, sig } = req.query;

    // 1. Verify chữ ký + thời hạn
    if (!verifySignedUrl(id, expires, sig)) {
      return res.status(403).json({ message: 'Link không hợp lệ hoặc đã hết hạn' });
    }

    // 2. Lấy product
    const product = await Product.findById(id).lean();
    if (!product || !product.audioUrl) {
      return res.status(404).json({ message: 'Không tìm thấy audio' });
    }

    // 3a. Audio trên Cloudinary / URL tuyệt đối
    // → REDIRECT thẳng thay vì proxy — tránh timeout Vercel 10s
    // → Cloudinary lo việc stream, Vercel chỉ xử lý redirect nhẹ
    if (/^https?:\/\//i.test(product.audioUrl)) {
      return res.redirect(302, product.audioUrl);
    }

    // 3b. Audio local (chỉ dùng khi dev local, Vercel không có filesystem)
    const filePath = path.join(__dirname, '../../public', product.audioUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File không tồn tại' });
    }

    const stat  = fs.statSync(filePath);
    const total = stat.size;
    const range = req.headers.range;

    res.setHeader('Content-Type', product.mimeType || 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-store');

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start     = parseInt(startStr, 10);
      const end       = endStr ? parseInt(endStr, 10) : total - 1;
      const chunkSize = end - start + 1;
      res.setHeader('Content-Range',  `bytes ${start}-${end}/${total}`);
      res.setHeader('Content-Length', chunkSize);
      res.status(206);
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.setHeader('Content-Length', total);
      res.status(200);
      fs.createReadStream(filePath).pipe(res);
    }

  } catch (err) {
    console.error('audioStream error:', err.message || err);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports.generateSignedUrl = generateSignedUrl;