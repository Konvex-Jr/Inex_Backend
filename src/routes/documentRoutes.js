const express = require('express');
const multer = require('multer');
const { uploadDocument, listDocuments } = require('../controllers/documentController');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', listDocuments);

module.exports = router; 