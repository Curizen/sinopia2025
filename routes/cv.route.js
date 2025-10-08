const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cv.controller');
const fileUpload = require('express-fileupload');

router.use(fileUpload());

router.post('/upload', cvController.uploadCV);

module.exports = router;
