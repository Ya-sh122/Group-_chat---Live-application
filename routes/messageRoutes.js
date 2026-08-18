const express = require('express');
const messageController = require('../controller/messageController');
const userAuth = require('../middleware/auth');
const s3Upload = require('../middleware/s3Upload');

const router = express.Router();

router.post('/send', userAuth.authenticate, messageController.sendMessage);
router.get('/group/:groupId', userAuth.authenticate, messageController.getGroupMessages);

// Notice the s3Upload.single('file') middleware.
// It intercepts the request, uploads the file to AWS S3, and THEN calls sendMedia.
router.post('/upload', userAuth.authenticate, s3Upload.single('file'), messageController.sendMedia);

module.exports = router;