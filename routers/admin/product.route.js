

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');

// // multer memory storage (controller đang upload buffer lên Cloudinary)
// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });
// // accept both audio file and thumbnail image
// const uploadFields = upload.fields([
//   { name: 'file', maxCount: 1 },
//   { name: 'thumbnail', maxCount: 1 }
// ]);

// // controllers / validate / optional uploadCloud
// const productsController = require('../../controller/admin/products.controller');
// const validate = require('../../validates/admin/products.validate.js');

// let uploadCloud;
// try {
//   uploadCloud = require('../../middeware/admin/uploadCloud.middeware.js');
// } catch (e) {
//   uploadCloud = null;
// }

// // Routes (handlers present in controller)
// router.get('/', productsController.products);

// // create form
// router.get('/create', productsController.create);

// // create POST: accept files (audio + thumbnail)
// router.post(
//   '/create',
//   uploadFields,
//   validate.createPost,
//   productsController.createPost
// );

// // edit form (GET)
// router.get('/edit/:id', productsController.edit);

// // edit PATCH: accept files (audio + thumbnail)
// router.patch(
//   '/edit/:id',
//   uploadFields,
//   validate.createPost,
//   productsController.editPost
// );

// // detail
// router.get('/detail/:id', productsController.detail);

// // save transcript (client posts transcript JSON)
// router.post('/:id/transcript', productsController.saveTranscript);

// // --- ensure these routes exist so client calling /admin/products/detail/:id/... works ---
// router.post('/detail/:id/transcribe', productsController.transcribeProduct);
// router.get('/detail/:id/transcribe-status/:transcriptId', productsController.transcribeStatus);
// router.post('/detail/:id/save-transcript', productsController.saveTranscriptFromAssembly);


// module.exports = router;

// routes/admin/products.js
// routes/admin/products.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// multer memory storage (controller uploads buffer to Cloudinary)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });
const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

const productsController = require('../../controller/admin/products.controller');
const validate = require('../../validates/admin/products.validate.js');

let uploadCloud;
try {
  uploadCloud = require('../../middeware/admin/uploadCloud.middeware.js');
} catch (e) {
  uploadCloud = null;
}

// Basic CRUD routes
router.get('/', productsController.products);
router.get('/create', productsController.create);
router.post('/create', uploadFields, validate.createPost, productsController.createPost);
router.get('/edit/:id', productsController.edit);
router.patch('/edit/:id', uploadFields, validate.createPost, productsController.editPost);
router.get('/detail/:id', productsController.detail);
router.patch('/update-position/:id', productsController.updatePosition);
router.delete('/delete/:id', productsController.deleteProduct);

// Transcript save (client posts transcript JSON)
// Register both variants so callers using either path work
router.post('/:id/transcript', productsController.saveTranscript);
router.post('/detail/:id/transcript', productsController.saveTranscript);

// --- New transcription workflow routes ---
// Register both variants so client code using "/detail/:id/..." works
// and other code using "/:id/..." also works.

//
// Create transcription job
//
router.post('/:id/transcribe', productsController.transcribeProduct);
router.post('/detail/:id/transcribe', productsController.transcribeProduct);

//
// Check transcription status
//
router.get('/:id/transcribe-status/:transcriptId', productsController.transcribeStatus);
router.get('/detail/:id/transcribe-status/:transcriptId', productsController.transcribeStatus);

//
// Save transcript (from provider or client)
//
router.post('/:id/save-transcript', productsController.saveTranscriptFromAssembly);
router.post('/detail/:id/save-transcript', productsController.saveTranscriptFromAssembly);

module.exports = router;

