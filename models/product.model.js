// const mongoose=require('mongoose')
// var slug=require('mongoose-slug-updater')
// mongoose.plugin(slug);
// const productSchema= new mongoose.Schema({
//    title: String,
//    product_category_id:{
//       type:String,
//       default:""
//    },
//   description:String,
//   price: Number,
//   discountPercentage:Number,
//   stock: Number,
//   thumbnail: String,
//   status:String,
//   position: Number,
//   deleted: {
//     type:Boolean,
//     default:false
//   },
//   deletedAt:Date,
//   slug:{
//     type:String,
//     slug:"title",
//     unique:true
//   }
// },{
//   timestamps:true
// });


// const Product=mongoose.model('Product',productSchema,"products")
// module.exports=Product;
const mongoose = require('mongoose');
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', default: null },
  episodeNumber: { type: Number, default: null },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  thumbnail: { type: String, default: '' },
  type: { type: String, enum: ['audio','image','product'], default: 'audio' },
  audioUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  duration: { type: Number, default: null },
  size: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  transcript: { type: String, default: '' },
  level: { type: String, default: '' },
  tags: [{ type: String }],
  language: { type: String, default: 'en' },
  explicit: { type: Boolean, default: false },
  bitrate: { type: Number, default: null },
  waveformUrl: { type: String, default: '' },
  license: { type: String, default: '' },
  licenseUrl: { type: String, default: '' },

  status: { type: String, default: 'active' },
  position: { type: Number, default: 0 },

  playCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  slug: { type: String, slug: 'title', unique: true }
}, {
  timestamps: true
});

// Indexes: chỉ dùng các trường thực sự tồn tại trong schema
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ episodeNumber: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ product_category_id: 1 });

const Product = mongoose.model('Product', productSchema, 'products');
module.exports = Product;
