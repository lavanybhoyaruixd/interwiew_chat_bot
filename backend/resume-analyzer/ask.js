import { Router } from 'express';
import Groq from 'groq-sdk';
import { getResumeData } from './resumeStore.js';

const router = Router();

function safeGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body || {};

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid question' });
    }

    const data = getResumeData();
    if (!data || !data.text) {
      return res.status(400).json({ success: false, error: 'Please upload a resume first' });
    }

    // Trim and cap resume size to keep request light
    const resumeText = data.text.length > 8000 ? data.text.slice(0, 8000) : data.text;

    const client = safeGroqClient();
    if (!client) {
      // Graceful fallback if no API key
      return res.status(200).json({
        success: true,
        answer: "[Local mode] GROQ_API_KEY missing. Based on resume: Not available in resume.",
      });
    }

    const system =
      "You must answer ONLY using this resume. If not found, say 'Not available in resume'. Be concise and factual.";
    const prompt = `Resume:\n\n${resumeText}\n\nQuestion: ${question}`;

    const completion = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      temperature: 0.2,
      max_tokens: 512,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    });

    const answer = completion?.choices?.[0]?.message?.content?.trim() || 'No response';

    return res.status(200).json({ success: true, answer });
  } catch (err) {
    console.error('[ASK] error:', err?.message || err);
    return res.status(500).json({ success: false, message: 'Internal server error during ask' });
  }
});

// Defensive route for non-POST method usage
router.all('/ask', (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST with JSON body { question }' });
  }
  return res.status(404).json({ success: false, message: 'Not found' });
});

export default router;
