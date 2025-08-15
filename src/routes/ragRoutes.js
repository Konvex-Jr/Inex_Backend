const express = require('express');
const multer = require('multer');
const { askQuestion } = require('../controllers/ragController');

const router = express.Router();
const upload = multer();

router.post('/ask',  upload.single('file'), askQuestion);

module.exports = router;
