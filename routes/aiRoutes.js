const express = require('express');
const aiController = require('../controller/aiController');
const userAuth = require('../middleware/auth');

const router = express.Router();

// Only logged-in users can request AI suggestions
router.post('/suggest', userAuth.authenticate, aiController.getChatSuggestion);

module.exports = router;