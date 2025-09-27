const mongoose=require('mongoose')
var slug=require('mongoose-slug-updater')
mongoose.plugin(slug);
const productCategorySchema= new mongoose.Schema({
   title: String,
   parent_id:{
    type:String,
    default:""
   },
  description:String,
  stock: Number,
  thumbnail: String,
  status:String,
  position: Number,
  deleted: {
    type:Boolean,
    default:false
  },
  deletedAt:Date,
  slug:{
    type:String,
    slug:"title",
    unique:true
  }
},{
  timestamps:true
});


const productCategory=mongoose.model('productCategory',productCategorySchema,"products-category")
module.exports=productCategory;