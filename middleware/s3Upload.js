require('dotenv').config(); 
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3 Client
const s3Config = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Multer to upload directly to S3
const upload = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create a unique file name using date and original name
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Remove spaces from original filename to prevent URL issues
      const cleanFileName = file.originalname.replace(/\s+/g, '-');
      const filename = `chat-media/${uniqueSuffix}-${cleanFileName}`;
      cb(null, filename);
    }
  })
});

module.exports = upload;