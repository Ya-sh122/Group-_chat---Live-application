const express = require('express');
const groupController = require('../controller/groupController');
const userAuth = require('../middleware/auth');

const router = express.Router();

// Notice we use userAuth.authenticate for all group routes
// This ensures only logged-in users can create/view/modify groups
router.post('/create', userAuth.authenticate, groupController.createGroup);
router.get('/my-groups', userAuth.authenticate, groupController.getUserGroups);
router.post('/add-user', userAuth.authenticate, groupController.addUserToGroup);

module.exports = router;