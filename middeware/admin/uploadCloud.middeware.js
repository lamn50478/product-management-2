//cloudinary
require('dotenv').config();
const cloudinary=require('cloudinary').v2;
const streamifier=require('streamifier');
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_KEY, 
  api_secret: process.env.CLOUD_SECRET,
});
//end cloudinary
console.log("Cloudinary config:", process.env.CLOUD_NAME, process.env.CLOUD_KEY, process.env.CLOUD_SECRET);


module.exports.upload= (req, res, next)=> {  
    if(req.file){
        console.log("File nhận được:", req.file);

        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                    resolve(result);
                    } else {
                    reject(error);
                    }
                }
                );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

    async function upload(req) {
        let result = await streamUpload(req);
        req.body[req.file.fieldname]=result.url;
        
        next();
    }
     upload(req);
        }
    else{
         next();
    }

}