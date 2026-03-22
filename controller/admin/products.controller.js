
// const path = require('path');
// const fs = require('fs');

// const mongoose = require('mongoose');
// const Product = require('../../models/product.model');
// const productCategory = require('../../models/products-category.model');
// const filterStatusHelpers = require('../../helpers/fillterStatus');
// const searchHelpers = require('../../helpers/search');
// const paginationHelpers = require('../../helpers/pagination');
// const createTreeHelper = require('../../helpers/create-tree');
// const systemConfig = require('../../config/system.js');

// // music-metadata (CommonJS compatible version 7.x)
// const mm = require('music-metadata');

// const streamifier = require('streamifier');

// // --- Cloudinary config embedded here (or fallback to local storage) ---
// let cloudinary = null;
// try {
//   const cloudinaryPkg = require('cloudinary');
//   cloudinary = cloudinaryPkg.v2;
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || '',
//     api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_KEY || '',
//     api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_SECRET || '',
//     secure: true
//   });

//   // If keys are empty, treat as not configured
//   if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
//     cloudinary = null;
//   }
// } catch (e) {
//   cloudinary = null;
// }

// // Helper: upload buffer to Cloudinary (returns result) or fallback to local file
// async function uploadBufferToCloudinary(buffer, options = {}) {
//   if (cloudinary) {
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto', ...options }, (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       });
//       streamifier.createReadStream(buffer).pipe(uploadStream);
//     });
//   } else {
//     // fallback: save to public/uploads and return a result-like object
//     const uploadsDir = path.join(__dirname, '../../public/uploads');
//     if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

//     const ext = (options && options.ext) || '';
//     const filename = `upload_${Date.now()}${ext}`;
//     const filepath = path.join(uploadsDir, filename);
//     await fs.promises.writeFile(filepath, buffer);

//     return {
//       secure_url: `/uploads/${filename}`,
//       url: `/uploads/${filename}`,
//       public_id: filename
//     };
//   }
// }

// // Utility: detect AJAX/json request
// function isJsonRequest(req) {
//   return req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1);
// }

// // [GET] /admin/products
// module.exports.products = async (req, res, next) => {
//   try {
//     const filterStatus = filterStatusHelpers(req.query);

//     const find = { deleted: false };
//     const objectSearch = searchHelpers(req.query);
//     if (objectSearch.regex) find.title = objectSearch.regex;
//     if (req.query.status) find.status = req.query.status;

//     const countProducts = await Product.countDocuments(find);
//     const objectPagination = paginationHelpers(
//       { currentPage: 1, limitPages: 10 },
//       countProducts,
//       req.query
//     );

//     let sort = {};
//     if (req.query.sortKey && req.query.sortValue) {
//       sort[req.query.sortKey] = req.query.sortValue;
//     } else {
//       sort.position = 'desc';
//     }

//     const products = await Product.find(find)
//       .sort(sort)
//       .limit(objectPagination.limitPages)
//       .skip(objectPagination.skip)
//       .lean();

//     res.render('admin/pages/products/products.pug', {
//       pageTitle: 'TRANG SẢN PHẨM',
//       products,
//       filterStatus,
//       keyword: objectSearch.keyword,
//       pagination: objectPagination,
//       prefixAdmin: systemConfig.prefixAdmin
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // [PATCH] /admin/products/change-status/:id
// module.exports.changeStatus = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const status = req.body.status;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
//       req.flash('error', 'ID không hợp lệ');
//       return res.redirect(`${systemConfig.prefixAdmin}/products`);
//     }

//     await Product.updateOne({ _id: id }, { status });

//     if (isJsonRequest(req)) return res.status(200).json({ success: true });
//     req.flash('success', 'Cập nhật trạng thái thành công!');
//     res.redirect(req.get('Referrer') || `${systemConfig.prefixAdmin}/products`);
//   } catch (err) {
//     next(err);
//   }
// };

// // [PATCH] /admin/products/change-multi
// module.exports.changeMulti = async (req, res, next) => {
//   try {
//     const type = req.body.type;
//     const ids = (req.body.ids || '').split(',').map(s => s.trim()).filter(Boolean);

//     switch (type) {
//       case 'active':
//         await Product.updateMany({ _id: { $in: ids } }, { status: 'active' });
//         req.flash('success', `Cập nhật thành công trạng thái của ${ids.length} sản phẩm`);
//         break;
//       case 'inactive':
//         await Product.updateMany({ _id: { $in: ids } }, { status: 'inactive' });
//         req.flash('success', `Cập nhật thành công trạng thái của ${ids.length} sản phẩm`);
//         break;
//       case 'delete-all':
//         await Product.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
//         req.flash('success', `Xóa thành công ${ids.length} sản phẩm`);
//         break;
//       case 'change-position':
//         for (const item of ids) {
//           const [id, position] = item.split('-');
//           if (mongoose.Types.ObjectId.isValid(id)) {
//             await Product.updateOne({ _id: id }, { position: parseInt(position || 0, 10) });
//           }
//         }
//         req.flash('success', `Thay đổi vị trí thành công ${ids.length} sản phẩm`);
//         break;
//       default:
//         break;
//     }

//     res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products`);
//   } catch (err) {
//     next(err);
//   }
// };

// // [DELETE] /admin/products/delete/:id
// module.exports.deleteProduct = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
//       req.flash('error', 'ID không hợp lệ');
//       return res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products`);
//     }

//     // soft delete
//     await Product.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });

//     if (isJsonRequest(req)) return res.status(200).json({ success: true });
//     req.flash('success', 'Xóa thành công sản phẩm');
//     res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products`);
//   } catch (err) {
//     next(err);
//   }
// };

// // [GET] /admin/products/create
// module.exports.create = async (req, res, next) => {
//   try {
//     const find = { deleted: false };
//     const categories = await productCategory.find(find).lean();
//     const newCategory = createTreeHelper.tree(categories);
//     res.render('admin/pages/products/create.pug', {
//       pageTitle: 'Thêm mới sản phẩm',
//       category: newCategory,
//       product: {},
//       prefixAdmin: systemConfig.prefixAdmin
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // [POST] /admin/products/create
// // [POST] /admin/products/create
// module.exports.createPost = [
//   async (req, res, next) => {
//     try {
//       // --- Debug: log request summary ---
//       console.log('--- createPost called ---');
//       console.log('req.body keys:', Object.keys(req.body || {}));
//       console.log('req.body (sample):', {
//         title: req.body.title,
//         product_category_id: req.body.product_category_id,
//         price: req.body.price,
//         position: req.body.position,
//         status: req.body.status
//       });
//       console.log('req.files keys:', req.files ? Object.keys(req.files) : null);
//       if (req.files && req.files.file && req.files.file[0]) {
//         console.log('Audio file received:', {
//           originalname: req.files.file[0].originalname,
//           mimetype: req.files.file[0].mimetype,
//           size: req.files.file[0].size
//         });
//       }
//       if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//         console.log('Thumbnail file received:', {
//           originalname: req.files.thumbnail[0].originalname,
//           mimetype: req.files.thumbnail[0].mimetype,
//           size: req.files.thumbnail[0].size
//         });
//       }

//       // parse numeric fields safely
//       req.body.price = parseFloat(req.body.price) || 0;
//       req.body.discountPercentage = parseFloat(req.body.discountPercentage) || 0;
//       req.body.stock = parseInt(req.body.stock, 10) || 0;
//       req.body.position = req.body.position === '' ? (await Product.countDocuments()) + 1 : parseInt(req.body.position || 0, 10);

//       const data = {
//         title: req.body.title,
//         product_category_id: req.body.product_category_id || null,
//         description: req.body.description || '',
//         price: req.body.price,
//         discountPercentage: req.body.discountPercentage,
//         stock: req.body.stock,
//         level: req.body.level || '',
//         position: req.body.position,
//         status: req.body.status || 'active',
//         type: 'audio',
//         transcript: req.body.transcript || ''
//       };

//       const audioFile = req.files && req.files.file ? req.files.file[0] : null;
//       const thumbFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

//       // handle audio file
//       if (audioFile) {
//         try {
//           const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/x-flac'];
//           if (!allowed.includes(audioFile.mimetype)) {
//             console.warn('Unsupported audio mimetype:', audioFile.mimetype);
//             if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng file không được hỗ trợ' });
//             req.flash('error', 'Định dạng file không được hỗ trợ');
//             return res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products/create`);
//           }

//           // parse metadata
//           let duration = null;
//           try {
//             const meta = await mm.parseBuffer(audioFile.buffer, audioFile.mimetype, { duration: true });
//             duration = meta.format && meta.format.duration ? Math.round(meta.format.duration) : null;
//             console.log('Audio metadata parsed, duration:', duration);
//           } catch (metaErr) {
//             console.warn('music-metadata parse error:', metaErr && metaErr.message);
//             duration = null;
//           }

//           // upload
//           console.log('Uploading audio to storage...');
//           const result = await uploadBufferToCloudinary(audioFile.buffer, { folder: 'podcasts', ext: path.extname(audioFile.originalname) });
//           console.log('Audio upload result:', result && (result.secure_url || result.url || result.public_id));

//           data.audioUrl = result.secure_url || result.url || '';
//           data.publicId = result.public_id || result.publicId || '';
//           data.duration = duration;
//           data.size = audioFile.size;
//           data.mimeType = audioFile.mimetype;
//         } catch (audioErr) {
//           console.error('Error handling audio file:', audioErr);
//           return next(audioErr);
//         }
//       } else {
//         console.log('No audio file uploaded in request.');
//       }

//       // handle thumbnail file (optional)
//       if (thumbFile) {
//         try {
//           const allowedImg = ['image/jpeg', 'image/png', 'image/webp'];
//           if (!allowedImg.includes(thumbFile.mimetype)) {
//             console.warn('Unsupported thumbnail mimetype:', thumbFile.mimetype);
//             if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng ảnh không hợp lệ' });
//             req.flash('error', 'Định dạng ảnh không hợp lệ');
//             return res.redirect(req.get('Referrer') || `${systemConfig.prefixAdmin}/products/create`);
//           }

//           console.log('Uploading thumbnail to storage...');
//           const thumbResult = await uploadBufferToCloudinary(thumbFile.buffer, { folder: 'podcasts/thumbnails', ext: path.extname(thumbFile.originalname) });
//           console.log('Thumbnail upload result:', thumbResult && (thumbResult.secure_url || thumbResult.url || thumbResult.public_id));

//           data.thumbnail = thumbResult.secure_url || thumbResult.url || '';
//           data.thumbnailPublicId = thumbResult.public_id || thumbResult.publicId || '';
//         } catch (thumbErr) {
//           console.error('Error handling thumbnail file:', thumbErr);
//           return next(thumbErr);
//         }
//       } else {
//         console.log('No thumbnail uploaded in request.');
//       }

//       // Debug: show final data to be saved
//       console.log('Final product data (preview):', {
//         title: data.title,
//         audioUrl: data.audioUrl,
//         thumbnail: data.thumbnail,
//         price: data.price,
//         position: data.position,
//         status: data.status
//       });

//       const product = new Product(data);
//       await product.save();

//       console.log('Product saved with _id:', product._id);

//       if (isJsonRequest(req)) return res.status(200).json({ success: true, product });
//       req.flash('success', 'Thêm mới sản phẩm thành công');
//       res.redirect(`${systemConfig.prefixAdmin}/products`);
//     } catch (err) {
//       console.error('createPost top-level error:', err && err.stack ? err.stack : err);
//       next(err);
//     }
//   }
// ];


// // [GET] /admin/products/edit/:id
// module.exports.edit = async (req, res, next) => {
//   try {
//     const find = { deleted: false, _id: req.params.id };
//     const product = await Product.findOne(find).lean();
//     if (!product) {
//       req.flash('error', 'Sản phẩm không tồn tại');
//       return res.redirect(`${systemConfig.prefixAdmin}/products`);
//     }
//     const categories = await productCategory.find({ deleted: false }).lean();
//     const newCategory = createTreeHelper.tree(categories);
//     res.render('admin/pages/products/edit.pug', {
//       pageTitle: 'Chỉnh sửa sản phẩm',
//       product,
//       category: newCategory,
//       prefixAdmin: systemConfig.prefixAdmin
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // [PATCH] /admin/products/edit/:id
// module.exports.editPost = [
//   async (req, res, next) => {
//     try {
//       const id = req.params.id;
//       if (!mongoose.Types.ObjectId.isValid(id)) {
//         if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
//         req.flash('error', 'ID không hợp lệ');
//         return res.redirect(`${systemConfig.prefixAdmin}/products`);
//       }

//       req.body.price = parseFloat(req.body.price) || 0;
//       req.body.discountPercentage = parseFloat(req.body.discountPercentage) || 0;
//       req.body.stock = parseInt(req.body.stock, 10) || 0;
//       req.body.position = parseInt(req.body.position, 10) || 0;

//       const updateData = {
//         title: req.body.title,
//         product_category_id: req.body.product_category_id || null,
//         description: req.body.description || '',
//         price: req.body.price,
//         discountPercentage: req.body.discountPercentage,
//         stock: req.body.stock,
//         level: req.body.level || '',
//         position: req.body.position,
//         status: req.body.status || 'active',
//         transcript: req.body.transcript || ''
//       };

//       const audioFile = req.files && req.files.file ? req.files.file[0] : null;
//       const thumbFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

//       if (audioFile) {
//         const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/x-flac'];
//         if (!allowed.includes(audioFile.mimetype)) {
//           if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng file không được hỗ trợ' });
//           req.flash('error', 'Định dạng file không được hỗ trợ');
//           return res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products`);
//         }

//         let duration = null;
//         try {
//           const meta = await mm.parseBuffer(audioFile.buffer, audioFile.mimetype, { duration: true });
//           duration = meta.format.duration ? Math.round(meta.format.duration) : null;
//         } catch (err) {
//           duration = null;
//         }

//         const result = await uploadBufferToCloudinary(audioFile.buffer, { folder: 'podcasts', ext: path.extname(audioFile.originalname) });

//         // optional: delete old file on cloudinary if exists
//         const existing = await Product.findById(id).lean();
//         if (existing && existing.publicId && cloudinary) {
//           try {
//             await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'auto' });
//           } catch (err) {
//             // ignore deletion error
//           }
//         }

//         updateData.audioUrl = result.secure_url || result.url || '';
//         updateData.publicId = result.public_id || result.publicId || '';
//         updateData.duration = duration;
//         updateData.size = audioFile.size;
//         updateData.mimeType = audioFile.mimetype;
//       }

//       if (thumbFile) {
//         const allowedImg = ['image/jpeg', 'image/png', 'image/webp'];
//         if (!allowedImg.includes(thumbFile.mimetype)) {
//           if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng ảnh không hợp lệ' });
//           req.flash('error', 'Định dạng ảnh không hợp lệ');
//           return res.redirect(req.get('Referrer') || `${systemConfig.prefixAdmin}/products`);
//         }
//         const thumbResult = await uploadBufferToCloudinary(thumbFile.buffer, { folder: 'podcasts/thumbnails', ext: path.extname(thumbFile.originalname) });

//         // optional: delete old thumbnail if you stored its public id
//         const existing = await Product.findById(id).lean();
//         if (existing && existing.thumbnailPublicId && cloudinary) {
//           try {
//             await cloudinary.uploader.destroy(existing.thumbnailPublicId, { resource_type: 'image' });
//           } catch (err) {
//             // ignore
//           }
//         }

//         updateData.thumbnail = thumbResult.secure_url || thumbResult.url || '';
//         updateData.thumbnailPublicId = thumbResult.public_id || thumbResult.publicId || '';
//       }

//       await Product.updateOne({ _id: id }, updateData);

//       if (isJsonRequest(req)) return res.status(200).json({ success: true });
//       req.flash('success', 'Chỉnh sửa thành công');
//       res.redirect(`${systemConfig.prefixAdmin}/products`);
//     } catch (err) {
//       next(err);
//     }
//   }
// ];

// // [PATCH] /admin/products/update-position/:id
// module.exports.updatePosition = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const position = parseInt(req.body.position, 10) || 0;
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
//     await Product.updateOne({ _id: id }, { position });
//     return res.status(200).json({ success: true });
//   } catch (err) {
//     next(err);
//   }
// };

// // [GET] /admin/products/detail/:id
// // [GET] /admin/products/detail/:id
// module.exports.detail = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       req.flash('error', 'ID không hợp lệ');
//       return res.redirect(`${systemConfig.prefixAdmin}/products`);
//     }

//     const find = { deleted: false, _id: id };
//     const product = await Product.findOne(find).lean();
//     if (!product) {
//       req.flash('error', 'Sản phẩm không tồn tại');
//       return res.redirect(`${systemConfig.prefixAdmin}/products`);
//     }

//     // --- Chuẩn bị transcript để frontend dùng (mảng {start,end,text}) ---
//     let transcript = [];
//     if (product.transcript) {
//       if (typeof product.transcript === 'string') {
//         try {
//           // nếu lưu dạng JSON string
//           const parsed = JSON.parse(product.transcript);
//           if (Array.isArray(parsed)) transcript = parsed;
//         } catch (e) {
//           // nếu product.transcript là VTT/SRT raw, bạn có thể parse sau hoặc để trống
//           transcript = [];
//         }
//       } else if (Array.isArray(product.transcript)) {
//         transcript = product.transcript;
//       }
//     }

//     // peaks: optional (precomputed waveform peaks array)
//     const peaks = product.peaks || null;

//     res.render('admin/pages/products/detail.pug', {
//       pageTitle: product.title || 'Chi tiết sản phẩm',
//       product,
//       transcript,
//       peaks,
//       prefixAdmin: systemConfig.prefixAdmin
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports.saveTranscript = async (req, res, next) => {
//     try { 
//       const id = req.params.id;
//        if (!mongoose.Types.ObjectId.isValid(id)) {
//          return res.status(400).json({ success: false, message: 'ID không hợp lệ' }); } 
//          // transcript gửi từ client: mảng [{start, end, text}, ...] hoặc chuỗi JSON 
//          let transcript = req.body.transcript || []; if (typeof transcript === 'string') {
//              try { transcript = JSON.parse(transcript);

//               }
//              catch (e) {
//                 transcript = []; } } 
//                 if (!Array.isArray(transcript)) transcript = []; 
//                 // lưu vào product (update field transcript) 
//                 await Product.updateOne({ _id: id }, {
//                    transcript }); 
//                    return res.json({
//                       success: true, message: 'Lưu transcript thành công' }); } 
//                       catch (err) { next(err); } };



//lan6
//---------------------------------------------------------------
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const util = require('util');
const { execFile } = require('child_process');
const os = require('os');
const axios = require('axios');

const mongoose = require('mongoose');
const Product = require('../../models/product.model');
const productCategory = require('../../models/products-category.model');
const filterStatusHelpers = require('../../helpers/fillterStatus');
const searchHelpers = require('../../helpers/search');
const paginationHelpers = require('../../helpers/pagination');
const createTreeHelper = require('../../helpers/create-tree');
const systemConfig = require('../../config/system.js');

const mm = require('music-metadata');
const streamifier = require('streamifier');

const execFileAsync = util.promisify(execFile);
const mkdtemp = util.promisify(fs.mkdtemp);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const rmdir = util.promisify(fs.rmdir);

// Cloudinary config
let cloudinary = null;
try {
  const cloudinaryPkg = require('cloudinary');
  cloudinary = cloudinaryPkg.v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_SECRET || '',
    secure: true
  });

  if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
    cloudinary = null;
  }
} catch (e) {
  cloudinary = null;
}

// upload buffer helper (Cloudinary or local fallback)
// When using local fallback, return absolute URL if APP_BASE_URL is configured.
async function uploadBufferToCloudinary(buffer, options = {}) {
  if (cloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto', ...options }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  } else {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = (options && options.ext) || '';
    const filename = `upload_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filepath, buffer);

    const base = (process.env.APP_BASE_URL || '').replace(/\/+$/, '');
    const relative = `/uploads/${filename}`;
    const absolute = base ? `${base}${relative}` : relative;

    return {
      secure_url: absolute,
      url: absolute,
      public_id: filename
    };
  }
}

function isJsonRequest(req) {
  return req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1);
}

// computePeaksFromBuffer: attempt to use audiowaveform CLI if available, fallback null
async function computePeaksFromBuffer(buffer) {
  const prefix = path.join(os.tmpdir(), 'awf-');
  let tmpDir;
  try {
    tmpDir = await mkdtemp(prefix);
    const inPath = path.join(tmpDir, 'input.wav');
    const outPath = path.join(tmpDir, 'out.json');

    await writeFile(inPath, buffer);

    try {
      await execFileAsync('audiowaveform', ['-i', inPath, '-o', outPath, '--pixels-per-second', '10', '--bits', '8', '--channels', '1']);
      const raw = await readFile(outPath, 'utf8');
      const parsed = JSON.parse(raw);
      const peaks = parsed && parsed.data ? parsed.data : null;

      try { await unlink(inPath); } catch(e){}
      try { await unlink(outPath); } catch(e){}
      try { await rmdir(tmpDir); } catch(e){}

      return peaks;
    } catch (err) {
      try { await unlink(inPath); } catch(e){}
      try { await rmdir(tmpDir); } catch(e){}
      return null;
    }
  } catch (err) {
    try { if (tmpDir) await rmdir(tmpDir); } catch(e){}
    return null;
  }
}


function getAssemblyApiKey() {
  const key = process.env.ASSEMBLY_API_KEY || '';
  const trimmed = typeof key === 'string' ? key.trim() : '';
  return trimmed || null;
}


function ensureAbsoluteAudioUrl(audioUrl, req) {
  if (!audioUrl) return null;
  if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
  const base = (process.env.APP_BASE_URL || '').replace(/\/+$/, '');
  if (base) return `${base}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
  if (req && req.protocol && req.get) {
    const host = req.get('host');
    if (host) return `${req.protocol}://${host}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
  }
  return audioUrl; // fallback (may be relative)
}


async function saveTranscriptToProduct(id, segments) {
  // default: save as array
  let saveValue = segments;

  try {
    const pathType = Product.schema && Product.schema.path && Product.schema.path('transcript');
    if (pathType && pathType.instance === 'String') {
      // schema expects string -> stringify
      saveValue = JSON.stringify(segments);
    }
  } catch (e) {
    // ignore and fallback to array
    saveValue = segments;
  }

  await Product.updateOne({ _id: id }, { transcript: saveValue });
}

// ----------------- Handlers -----------------

// [GET] /admin/products
module.exports.products = async (req, res, next) => {
  try {
    const filterStatus = filterStatusHelpers(req.query);
    const find = { deleted: false };
    const objectSearch = searchHelpers(req.query);
    if (objectSearch.regex) find.title = objectSearch.regex;
    if (req.query.status) find.status = req.query.status;

    const countProducts = await Product.countDocuments(find);
    const objectPagination = paginationHelpers({ currentPage: 1, limitPages: 10 }, countProducts, req.query);

    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort.position = 'desc';
    }

    const products = await Product.find(find).sort(sort).limit(objectPagination.limitPages).skip(objectPagination.skip).lean();

    res.render('admin/pages/products/products.pug', {
      pageTitle: 'TRANG SẢN PHẨM',
      products,
      filterStatus,
      keyword: objectSearch.keyword,
      pagination: objectPagination,
      prefixAdmin: systemConfig.prefixAdmin
    });
  } catch (err) {
    next(err);
  }
};

// [GET] create form
module.exports.create = async (req, res, next) => {
  try {
    const categories = await productCategory.find({ deleted: false }).lean();
    const newCategory = createTreeHelper.tree(categories);
    res.render('admin/pages/products/create.pug', {
      pageTitle: 'Tạo sản phẩm',
      category: newCategory,
      prefixAdmin: systemConfig.prefixAdmin
    });
  } catch (err) {
    next(err);
  }
};

// [POST] /admin/products/create



module.exports.createPost = async function (req, res, next) {
  const requestId = Date.now();
  try {
    // console.log(`[${requestId}] --- createPost called ---`);
    // console.log(`[${requestId}] req.body keys:`, Object.keys(req.body || {}));
    // console.log(`[${requestId}] req.files keys:`, req.files ? Object.keys(req.files) : null);
    // console.log(`[${requestId}] req.body (full):\n`, util.inspect(req.body, { depth: 4 }));

    // Normalize numeric fields
    req.body.price = parseFloat(req.body.price) || 0;
    req.body.discountPercentage = parseFloat(req.body.discountPercentage) || 0;
    req.body.stock = parseInt(req.body.stock, 10) || 0;
    req.body.position = req.body.position === '' ? (await Product.countDocuments()) + 1 : parseInt(req.body.position || 0, 10);

    // Debug raw category value
    // console.log(`[${requestId}] raw product_category_id:`, req.body.product_category_id, 'type:', typeof req.body.product_category_id);

    // Validate / normalize product_category_id
    // Validate / normalize product_category_id
let rawCat = req.body.product_category_id;
if (!rawCat || rawCat === '') {
  rawCat = null;
} else if (typeof rawCat === 'string' && rawCat.startsWith('--')) {
  rawCat = null;
} else if (mongoose.Types.ObjectId.isValid(rawCat)) {
  rawCat = rawCat.toString(); // giữ string id
} else {
  console.warn(`[${requestId}] product_category_id is not a valid ObjectId, setting to null:`, rawCat);
  rawCat = null;
}


    const data = {
      title: req.body.title,
      product_category_id: rawCat,
      description: req.body.description || '',
      price: req.body.price,
      discountPercentage: req.body.discountPercentage,
      stock: req.body.stock,
      level: req.body.level || '',
      position: req.body.position,
      status: req.body.status || 'active',
      type: 'audio',
      transcript: req.body.transcript || ''
    };

    console.log(`[${requestId}] product data before files:\n`, util.inspect(data, { depth: 3 }));

    const audioFile = req.files && req.files.file ? req.files.file[0] : null;
    const thumbFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (audioFile) {
      console.log(`[${requestId}] audioFile info:`, {
        originalname: audioFile.originalname,
        mimetype: audioFile.mimetype,
        size: audioFile.size
      });

      const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/x-flac'];
      if (!allowed.includes(audioFile.mimetype)) {
        console.warn(`[${requestId}] Unsupported audio mimetype:`, audioFile.mimetype);
        if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng file không được hỗ trợ' });
        req.flash('error', 'Định dạng file không được hỗ trợ');
        return res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products/create`);
      }

      let duration = null;
      try {
        const meta = await mm.parseBuffer(audioFile.buffer, audioFile.mimetype, { duration: true });
        duration = meta.format && meta.format.duration ? Math.round(meta.format.duration) : null;
      } catch (metaErr) {
        console.warn(`[${requestId}] mm.parseBuffer failed:`, metaErr && metaErr.message ? metaErr.message : metaErr);
        duration = null;
      }

      try {
        console.log(`[${requestId}] Uploading audio to storage...`);
        const result = await uploadBufferToCloudinary(audioFile.buffer, { folder: 'podcasts', ext: path.extname(audioFile.originalname) });
        console.log(`[${requestId}] Audio upload result:`, util.inspect(result, { depth: 2 }));

        data.audioUrl = result.secure_url || result.url || '';
        data.publicId = result.public_id || result.publicId || '';
        data.duration = duration;
        data.size = audioFile.size;
        data.mimeType = audioFile.mimetype;
      } catch (audioErr) {
        console.error(`[${requestId}] Error handling audio file:`, audioErr && audioErr.stack ? audioErr.stack : audioErr);
        return next(audioErr);
      }
    } else {
      console.log(`[${requestId}] No audio file uploaded in request.`);
    }

    if (thumbFile) {
      console.log(`[${requestId}] thumbFile info:`, {
        originalname: thumbFile.originalname,
        mimetype: thumbFile.mimetype,
        size: thumbFile.size
      });

      const allowedImg = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedImg.includes(thumbFile.mimetype)) {
        console.warn(`[${requestId}] Unsupported thumbnail mimetype:`, thumbFile.mimetype);
        if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng ảnh không hợp lệ' });
        req.flash('error', 'Định dạng ảnh không hợp lệ');
        return res.redirect(req.get('Referrer') || `${systemConfig.prefixAdmin}/products/create`);
      }

      try {
        console.log(`[${requestId}] Uploading thumbnail to storage...`);
        const thumbResult = await uploadBufferToCloudinary(thumbFile.buffer, { folder: 'podcasts/thumbnails', ext: path.extname(thumbFile.originalname) });
        console.log(`[${requestId}] Thumb upload result:`, util.inspect(thumbResult, { depth: 2 }));

        data.thumbnail = thumbResult.secure_url || thumbResult.url || '';
        data.thumbnailPublicId = thumbResult.public_id || thumbResult.publicId || '';
      } catch (thumbErr) {
        console.error(`[${requestId}] Error handling thumbnail file:`, thumbErr && thumbErr.stack ? thumbErr.stack : thumbErr);
        return next(thumbErr);
      }
    } else {
      console.log(`[${requestId}] No thumbnail uploaded in request.`);
    }

    console.log(`[${requestId}] final product data to save:\n`, util.inspect(data, { depth: 4 }));

    try {
      const product = new Product(data);
      await product.save();
      console.log(`[${requestId}] Product saved, id:`, product._id && product._id.toString());

      if (isJsonRequest(req)) return res.status(200).json({ success: true, product });
      req.flash('success', 'Thêm mới sản phẩm thành công');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    } catch (saveErr) {
      console.error(`[${requestId}] Mongoose save error:`, saveErr && saveErr.stack ? saveErr.stack : saveErr);
      if (saveErr && saveErr.name === 'ValidationError' && saveErr.errors) {
        for (const k in saveErr.errors) {
          console.error(`[${requestId}] Validation error - ${k}:`, saveErr.errors[k].message, saveErr.errors[k]);
        }
      }
      if (isJsonRequest(req)) {
        return res.status(400).json({ success: false, message: saveErr.message || 'Save failed', errors: saveErr.errors || null });
      }
      req.flash('error', 'Lưu sản phẩm thất bại');
      return res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products/create`);
    }

  } catch (err) {
    console.error('createPost top-level error:', err && err.stack ? err.stack : err);
    next(err);
  }
};


// [GET] edit form
module.exports.edit = async (req, res, next) => {
  try {
    const find = { deleted: false, _id: req.params.id };
    const product = await Product.findOne(find).lean();
    if (!product) {
      req.flash('error', 'Sản phẩm không tồn tại');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    const categories = await productCategory.find({ deleted: false }).lean();
    const newCategory = createTreeHelper.tree(categories);
    res.render('admin/pages/products/edit.pug', {
      pageTitle: 'Chỉnh sửa sản phẩm',
      product,
      category: newCategory,
      prefixAdmin: systemConfig.prefixAdmin
    });
  } catch (err) {
    next(err);
  }
};

// [PATCH] editPost
module.exports.editPost = async function (req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      req.flash('error', 'ID không hợp lệ');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    req.body.price = parseFloat(req.body.price) || 0;
    req.body.discountPercentage = parseFloat(req.body.discountPercentage) || 0;
    req.body.stock = parseInt(req.body.stock, 10) || 0;
    req.body.position = parseInt(req.body.position, 10) || 0;

    const updateData = {
      title: req.body.title,
      product_category_id: req.body.product_category_id || null,
      description: req.body.description || '',
      price: req.body.price,
      discountPercentage: req.body.discountPercentage,
      stock: req.body.stock,
      level: req.body.level || '',
      position: req.body.position,
      status: req.body.status || 'active',
      transcript: req.body.transcript || ''
    };

    const audioFile = req.files && req.files.file ? req.files.file[0] : null;
    const thumbFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (audioFile) {
      const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/x-flac'];
      if (!allowed.includes(audioFile.mimetype)) {
        if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng file không được hỗ trợ' });
        req.flash('error', 'Định dạng file không được hỗ trợ');
        return res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products`);
      }

      let duration = null;
      try {
        const meta = await mm.parseBuffer(audioFile.buffer, audioFile.mimetype, { duration: true });
        duration = meta.format.duration ? Math.round(meta.format.duration) : null;
      } catch (err) {
        duration = null;
      }

      const result = await uploadBufferToCloudinary(audioFile.buffer, { folder: 'podcasts', ext: path.extname(audioFile.originalname) });

      const existing = await Product.findById(id).lean();
      if (existing && existing.publicId && cloudinary) {
        try { await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'auto' }); } catch(e){}
      }

      updateData.audioUrl = result.secure_url || result.url || '';
      updateData.publicId = result.public_id || result.publicId || '';
      updateData.duration = duration;
      updateData.size = audioFile.size;
      updateData.mimeType = audioFile.mimetype;
    }

    if (thumbFile) {
      const allowedImg = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedImg.includes(thumbFile.mimetype)) {
        if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Định dạng ảnh không hợp lệ' });
        req.flash('error', 'Định dạng ảnh không hợp lệ');
        return res.redirect(req.get('Referrer') || `${systemConfig.prefixAdmin}/products`);
      }
      const thumbResult = await uploadBufferToCloudinary(thumbFile.buffer, { folder: 'podcasts/thumbnails', ext: path.extname(thumbFile.originalname) });

      const existing = await Product.findById(id).lean();
      if (existing && existing.thumbnailPublicId && cloudinary) {
        try { await cloudinary.uploader.destroy(existing.thumbnailPublicId, { resource_type: 'image' }); } catch(e){}
      }

      updateData.thumbnail = thumbResult.secure_url || thumbResult.url || '';
      updateData.thumbnailPublicId = thumbResult.public_id || thumbResult.publicId || '';
    }

    await Product.updateOne({ _id: id }, updateData);

    if (isJsonRequest(req)) return res.status(200).json({ success: true });
    req.flash('success', 'Chỉnh sửa thành công');
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  } catch (err) {
    next(err);
  }
};

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'ID không hợp lệ');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    
    const find = { deleted: false, _id: id };
    const product = await Product.findOne(find).lean();
    if (!product) {
      req.flash('error', 'Sản phẩm không tồn tại');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    const categoryName=await productCategory.findOne({
      deleted:false,
      _id:product.product_category_id,
      status:"active"
    });
    product.categoryName=categoryName.title;
    let transcript = [];
    if (product.transcript) {
      // product.transcript may be stored as JSON string or array
      if (typeof product.transcript === 'string') {
        try {
          const parsed = JSON.parse(product.transcript);
          if (Array.isArray(parsed)) transcript = parsed;
        } catch (e) {
          transcript = [];
        }
      } else if (Array.isArray(product.transcript)) {
        transcript = product.transcript;
      }
    }

    // For FE-only waveform: do not rely on server-side peaks.
    const peaks = null;

    res.render('admin/pages/products/detail.pug', {
      pageTitle: product.title || 'Chi tiết sản phẩm',
      product,
      transcript,
      peaks,
      prefixAdmin: systemConfig.prefixAdmin
    });
  } catch (err) {
    next(err);
  }
};

// save transcript (client posts transcript JSON)
module.exports.saveTranscript = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    let transcript = req.body.transcript || [];
    if (typeof transcript === 'string') {
      try { transcript = JSON.parse(transcript); } catch (e) { transcript = []; }
    }
    if (!Array.isArray(transcript)) transcript = [];

    await saveTranscriptToProduct(id, transcript);

    return res.json({ success: true, message: 'Lưu transcript thành công' });
  } catch (err) {
    next(err);
  }
};

// ----------------- Additional handlers (transcription via AssemblyAI) -----------------

/**
 * POST /admin/products/:id/transcribe
 * Create a transcription job at AssemblyAI using product.audioUrl.
 * Returns { success: true, transcriptId } so FE can poll status.
 */
module.exports.transcribeProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });

    const product = await Product.findById(id).lean();
    if (!product || !product.audioUrl) return res.status(400).json({ success: false, message: 'Không có audio để transcribe' });

    const ASSEMBLY_API_KEY = getAssemblyApiKey();
    if (!ASSEMBLY_API_KEY) return res.status(500).json({ success: false, message: 'AssemblyAI API key not configured' });

    // Ensure audio URL is absolute and publicly accessible
    let audioUrl = ensureAbsoluteAudioUrl(product.audioUrl, req);
    console.log('transcribeProduct: using audioUrl =', audioUrl);

    // AssemblyAI requires speech_models array in payload
    const payload = {
      audio_url: audioUrl,
      speech_models: ['universal-2'] // change to ['universal-3-pro'] if your account supports it
    };

    try {
      const createResp = await axios.post('https://api.assemblyai.com/v2/transcript', payload, {
        headers: { authorization: ASSEMBLY_API_KEY, 'content-type': 'application/json' },
        timeout: 20000
      });

      const transcriptId = createResp.data && createResp.data.id;
      if (!transcriptId) {
        console.error('AssemblyAI create transcript returned no id:', createResp.data);
        return res.status(500).json({ success: false, message: 'Failed to create transcription job' });
      }

      return res.json({ success: true, transcriptId });
    } catch (err) {
      // Improved error handling: include message when response is undefined (network, timeout, etc.)
      console.error('AssemblyAI create transcript error:', err.message || err);
      console.error('AssemblyAI create transcript error response data:', err.response?.data);
      const status = err.response?.status;
      const data = err.response?.data;
      const message = data?.error || data?.message || err.message || 'AssemblyAI request failed';
      return res.status(status || 500).json({ success: false, message });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/products/:id/transcribe-status/:transcriptId
 * Poll AssemblyAI for job status and return the raw status object.
 */
module.exports.transcribeStatus = async (req, res, next) => {
  try {
    const transcriptId = req.params.transcriptId;
    const ASSEMBLY_API_KEY = getAssemblyApiKey();
    if (!ASSEMBLY_API_KEY) return res.status(500).json({ success: false, message: 'AssemblyAI API key not configured' });

    try {
      const resp = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLY_API_KEY },
        timeout: 15000
      });
      return res.json({ success: true, data: resp.data });
    } catch (err) {
      console.error('AssemblyAI status error:', err.message || err);
      console.error('AssemblyAI status error response data:', err.response?.data);
      const status = err.response?.status;
      const data = err.response?.data;
      const message = data?.error || data?.message || err.message || 'AssemblyAI status request failed';
      return res.status(status || 500).json({ success: false, message });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/products/:id/save-transcript
 * When AssemblyAI job is completed, fetch paragraphs (or words) and convert to segments,
 * then save to product.transcript as an array of { start, end, text } (seconds).
 *
 * Body: { transcriptId: string }
 */
module.exports.saveTranscriptFromAssembly = async (req, res, next) => {
  try {
    const id = req.params.id;
    const transcriptId = req.body.transcriptId;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    if (!transcriptId) return res.status(400).json({ success: false, message: 'Missing transcriptId' });

    const ASSEMBLY_API_KEY = getAssemblyApiKey();
    if (!ASSEMBLY_API_KEY) return res.status(500).json({ success: false, message: 'AssemblyAI API key not configured' });

    // Try to fetch paragraphs first (more readable segments). Fallback to words if paragraphs not available.
    let paragraphs = [];
    try {
      const paraResp = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}/paragraphs`, {
        headers: { authorization: ASSEMBLY_API_KEY },
        timeout: 15000
      });
      paragraphs = paraResp.data && paraResp.data.paragraphs ? paraResp.data.paragraphs : [];
    } catch (e) {
      console.warn('Failed to fetch paragraphs, will fallback to words. Error:', e.response?.data || e.message);
      paragraphs = [];
    }

    let segments = [];
    if (paragraphs && paragraphs.length) {
      segments = paragraphs.map(p => ({
        start: Math.round((p.start || 0) / 1000),
        end: Math.round((p.end || 0) / 1000),
        text: (p.text || '').trim()
      })).filter(s => s.text);
    } else {
      // Fallback: fetch words and group into small segments (e.g., 5s windows) if paragraphs not available
      try {
        const wordsResp = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}/words`, {
          headers: { authorization: ASSEMBLY_API_KEY },
          timeout: 15000
        });
        const words = wordsResp.data && wordsResp.data.words ? wordsResp.data.words : [];
        if (words && words.length) {
          // Group words into segments by time window (simple grouping)
          const windowSec = 5; // 5-second segments (adjustable)
          let curSeg = null;
          for (const w of words) {
            const wStart = Math.round((w.start || 0) / 1000);
            const wEnd = Math.round((w.end || 0) / 1000);
            if (!curSeg) {
              curSeg = { start: wStart, end: wEnd, text: w.text };
            } else if (wStart - curSeg.start <= windowSec) {
              curSeg.end = wEnd;
              curSeg.text += ' ' + w.text;
            } else {
              segments.push(curSeg);
              curSeg = { start: wStart, end: wEnd, text: w.text };
            }
          }
          if (curSeg) segments.push(curSeg);
        }
      } catch (e) {
        console.error('Failed to fetch words from AssemblyAI:', e.response?.data || e.message);
      }
    }

    // Save segments to product.transcript (handle schema type)
    try {
      await saveTranscriptToProduct(id, segments);
    } catch (e) {
      console.error('Failed to save transcript to product:', e.message || e);
      // If saving failed due to schema mismatch, attempt to coerce to string
      try {
        await Product.updateOne({ _id: id }, { transcript: JSON.stringify(segments) });
      } catch (e2) {
        console.error('Fallback save also failed:', e2.message || e2);
        return res.status(500).json({ success: false, message: 'Failed to save transcript' });
      }
    }

    return res.json({ success: true, segments, count: segments.length });
  } catch (err) {
    console.error('saveTranscriptFromAssembly error:', err.response?.data || err.message || err);
    next(err);
  }
};

// ----------------- New handlers required by router -----------------

/**
 * PATCH /admin/products/update-position/:id
 * Body: { position: Number }
 * Update product position (simple setter).
 */
module.exports.updatePosition = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      req.flash('error', 'ID không hợp lệ');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    const position = parseInt(req.body.position, 10);
    if (Number.isNaN(position)) {
      if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'Position không hợp lệ' });
      req.flash('error', 'Position không hợp lệ');
      return res.redirect(req.get('Referer') || `${systemConfig.prefixAdmin}/products`);
    }

    await Product.updateOne({ _id: id }, { position });

    if (isJsonRequest(req)) return res.json({ success: true });
    req.flash('success', 'Cập nhật vị trí thành công');
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /admin/products/delete/:id
 * Soft-delete product (set deleted: true). Also attempt to remove cloud assets if configured.
 */
module.exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (isJsonRequest(req)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      req.flash('error', 'ID không hợp lệ');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    const existing = await Product.findById(id).lean();
    if (!existing) {
      if (isJsonRequest(req)) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
      req.flash('error', 'Sản phẩm không tồn tại');
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    // Try to delete cloud assets if cloudinary configured
    if (cloudinary) {
      if (existing.publicId) {
        try { await cloudinary.uploader.destroy(existing.publicId, { resource_type: 'auto' }); } catch (e) { console.warn('Failed to destroy audio publicId', e); }
      }
      if (existing.thumbnailPublicId) {
        try { await cloudinary.uploader.destroy(existing.thumbnailPublicId, { resource_type: 'image' }); } catch (e) { console.warn('Failed to destroy thumbnailPublicId', e); }
      }
    }

    // Soft delete
    await Product.updateOne({ _id: id }, { deleted: true });

    if (isJsonRequest(req)) return res.json({ success: true });
    req.flash('success', 'Xóa sản phẩm thành công');
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  } catch (err) {
    next(err);
  }
};

