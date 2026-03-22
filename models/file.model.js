// const mongoose = require('mongoose');
// var slug = require('mongoose-slug-updater');
// mongoose.plugin(slug);

// const productSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', default: null },
//   episodeNumber: { type: Number, default: null },
//   description: { type: String, default: '' },
//   price: { type: Number, default: 0 },
//   discountPercentage: { type: Number, default: 0 },
//   stock: { type: Number, default: 0 },
//   thumbnail: { type: String, default: '' },
//   // media-specific fields
//   type: { type: String, enum: ['audio','image','product'], default: 'audio' },
//   audioUrl: { type: String, default: '' },
//   publicId: { type: String, default: '' },
//   duration: { type: Number, default: null }, // seconds
//   size: { type: Number, default: 0 }, // bytes
//   mimeType: { type: String, default: '' },
//   transcript: { type: String, default: '' },
//   level: { type: String, default: '' }, // or ObjectId ref to Levels
//   tags: [{ type: String }],
//   language: { type: String, default: 'en' },
//   explicit: { type: Boolean, default: false },
//   bitrate: { type: Number, default: null },
//   waveformUrl: { type: String, default: '' },
//   license: { type: String, default: '' },
//   licenseUrl: { type: String, default: '' },

//   // existing product fields
//   status: { type: String, default: 'active' },
//   position: { type: Number, default: 0 },

//   // analytics
//   playCount: { type: Number, default: 0 },
//   downloadCount: { type: Number, default: 0 },

//   // ownership and soft delete
//   uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   deleted: { type: Boolean, default: false },
//   deletedAt: { type: Date, default: null },

//   slug: { type: String, slug: 'title', unique: true }
// }, {
//   timestamps: true
// });

// productSchema.index({ title: 'text', description: 'text', tags: 'text' });
// productSchema.index({ showId: 1, episodeNumber: 1 });
// productSchema.index({ status: 1, publishDate: -1 });
// productSchema.index({ product_category_id: 1 });

// const Product = mongoose.model('Product', productSchema, 'products');
// module.exports = Product;
