const express = require('express');
const router = express.Router();
const accountController = require('../controllers/auth.controller');

router.post('/signup', accountController.signup);
router.post('/signin', accountController.signin);
router.get('/logout', accountController.logout);
module.exports = router;
