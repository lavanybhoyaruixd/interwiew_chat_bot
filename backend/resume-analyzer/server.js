import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import uploadRouter from './upload.js';
import askRouter from './ask.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Basic hardening + JSON
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/', uploadRouter);
app.use('/', askRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.path, method: req.method });
});

// Error handler (never crash)
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err?.stack || err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Resume Analyzer backend listening on http://localhost:${PORT}`);
});
