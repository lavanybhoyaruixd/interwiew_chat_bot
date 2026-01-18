import { Router } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';
import { setResumeData } from './resumeStore.js';

const router = Router();

// Multer setup: memory storage, PDF-only, 5MB max
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    // Guard: multer not attached or parsing failure
    if (!req || !req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please attach a PDF as form-data (key: resume).' });
    }

    // Debug logs for troubleshooting common 500s
    console.log('[UPLOAD] file received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Extract text from PDF buffer
    let text = '';
    try {
      const parsed = await pdf(req.file.buffer);
      text = (parsed.text || '').trim();
    } catch (e) {
      console.error('[UPLOAD] pdf-parse error:', e?.message || e);
      return res.status(400).json({ success: false, message: 'Failed to parse PDF. Please upload a valid PDF file.' });
    }

    if (!text) {
      return res.status(400).json({ success: false, message: 'No text content found in PDF.' });
    }

    // Save to global in-memory store
    setResumeData({
      text,
      meta: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });

    // Respond with a safe preview
    const preview = text.slice(0, 200);
    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      preview,
      length: text.length,
    });
  } catch (err) {
    console.error('[UPLOAD] unexpected error:', err?.message || err);
    return res.status(500).json({ success: false, message: 'Internal server error during upload' });
  }
});

// Defensive route for non-POST method usage
router.all('/upload', (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST with form-data (resume: <pdf>)' });
  }
  return res.status(404).json({ success: false, message: 'Not found' });
});

export default router;
