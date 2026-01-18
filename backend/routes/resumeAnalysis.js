const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Groq } = require('groq-sdk');
const router = express.Router();

// In-memory store for demo (replace with database in production)
let resumeStore = {};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Upload and analyze resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Extract text from PDF
    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text;
    const resumeId = Date.now().toString(); // Simple ID generation
    
    // Analyze resume with AI
    const analysis = await analyzeResume(resumeText);
    
    // Store the resume data
    resumeStore[resumeId] = {
      text: resumeText,
      analysis,
      createdAt: new Date().toISOString()
    };

    res.status(200).json({ 
      success: true, 
      message: 'Resume processed successfully',
      data: {
        resumeId,
        analysis
      }
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing resume',
      error: error.message 
    });
  }
});

// Ask question about resume
router.post('/ask', async (req, res) => {
  try {
    const { question, resumeId } = req.body;
    
    if (!resumeId || !resumeStore[resumeId]) {
      return res.status(400).json({
        success: false,
        message: 'No resume found. Please upload a resume first.'
      });
    }

    const resume = resumeStore[resumeId];
    const answer = await askAboutResume(question, resume.text);

    res.status(200).json({
      success: true,
      answer
    });
  } catch (error) {
    console.error('Error asking question:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your question',
      error: error.message
    });
  }
});

// Helper function to calculate ATS (Applicant Tracking System) score
function calculateATSScore(text) {
  const textLower = text.toLowerCase();
  let score = 0;
  const feedback = {
    positives: [],
    warnings: [],
    suggestions: []
  };

  // 1. Check for essential sections (30 points)
  const essentialSections = [
    { name: 'contact information', keywords: ['email', 'phone', 'linkedin', 'github'], weight: 5 },
    { name: 'work experience', keywords: ['experience', 'employment', 'work history'], weight: 10 },
    { name: 'education', keywords: ['education', 'university', 'college', 'degree'], weight: 5 },
    { name: 'skills', keywords: ['skills', 'technologies', 'programming'], weight: 5 },
    { name: 'achievements', keywords: ['achievements', 'awards', 'certifications'], weight: 5 }
  ];

  essentialSections.forEach(section => {
    const hasSection = section.keywords.some(keyword => textLower.includes(keyword));
    if (hasSection) {
      score += section.weight;
      feedback.positives.push(`✓ Includes ${section.name} section`);
    } else {
      feedback.suggestions.push(`Consider adding a ${section.name} section`);
    }
  });

  // 2. Check for ATS-friendly formatting (20 points)
  const hasBulletPoints = /•|\*|\d+\./.test(text);
  const hasActionVerbs = /managed|developed|created|implemented|led|improved|increased|reduced|designed|built/i.test(text);
  const hasQuantifiableResults = /\d+%|\$\d+|\d+\+?\s*(years?|months?)|saved\s+\$|increased\s+by|reduced\s+by/i.test(text);
  
  if (hasBulletPoints) { score += 5; feedback.positives.push('✓ Uses bullet points for readability'); }
  if (hasActionVerbs) { score += 5; feedback.positives.push('✓ Uses strong action verbs'); }
  if (hasQuantifiableResults) { 
    score += 10; 
    feedback.positives.push('✓ Includes quantifiable achievements'); 
  } else {
    feedback.suggestions.push('Add more quantifiable results (e.g., "increased sales by 20%")');
  }

  // 3. Check for ATS optimization (30 points)
  const commonKeywords = [
    // Technical skills
    'javascript', 'python', 'java', 'c++', 'sql', 'react', 'node.js', 'aws', 'docker', 'kubernetes',
    // Soft skills
    'leadership', 'teamwork', 'communication', 'problem-solving', 'time management',
    // Job-specific terms
    'agile', 'scrum', 'ci/cd', 'devops', 'api', 'rest', 'graphql', 'microservices'
  ];

  const foundKeywords = commonKeywords.filter(keyword => 
    new RegExp(`\\b${keyword}\\b`, 'i').test(textLower)
  );
  
  const keywordScore = Math.min(30, (foundKeywords.length / commonKeywords.length) * 30);
  score += keywordScore;
  feedback.positives.push(`✓ Contains ${foundKeywords.length} ATS-optimized keywords`);

  // 4. Check for potential issues (deductions)
  const issues = {
    'headers/footers': /header|footer|page \d+ of \d+/i.test(text),
    'tables': /<table>|\btd\b|\btr\b/i.test(text),
    'graphics/images': /<img|\[image|\[graphic/i.test(text),
    'uncommon fonts': /font-family|@font-face|font:/i.test(text),
    'personal pronouns': /\b(i|me|my|mine|myself)\b/i.test(textLower)
  };

  Object.entries(issues).forEach(([issue, hasIssue]) => {
    if (hasIssue) {
      score = Math.max(0, score - 5);
      feedback.warnings.push(`⚠️ Avoid ${issue} in ATS-optimized resumes`);
    }
  });

  // 5. Check length (20 points)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 400 && wordCount <= 800) {
    score += 15;
    feedback.positives.push('✓ Optimal resume length');
  } else if (wordCount > 0) {
    feedback.suggestions.push(
      wordCount < 400 
        ? 'Consider adding more details to your resume' 
        : 'Consider making your resume more concise'
    );
  }
  
  // Ensure score is between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  
  return {
    score: finalScore,
    feedback: {
      positives: [...new Set(feedback.positives)],
      warnings: [...new Set(feedback.warnings)],
      suggestions: [...new Set(feedback.suggestions)],
      keywordMatches: foundKeywords,
      wordCount
    }
  };
}

// Helper function to generate resume summary
async function generateResumeSummary(text) {
  const prompt = `Please provide a concise 3-4 sentence summary of the following resume. 
  Focus on key skills, experience level, and notable achievements. Be specific and professional.

  Resume:
  ${text.substring(0, 10000)}`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume writer. Provide a clear, professional summary.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama3-8b-8192',
    temperature: 0.3,
    max_tokens: 300
  });

  return response.choices[0].message.content.trim();
}

// Helper function to analyze resume
async function analyzeResume(text) {
  // Generate summary and calculate ATS score in parallel
  const [summary, atsAnalysis] = await Promise.all([
    generateResumeSummary(text),
    calculateATSScore(text)
  ]);

  const prompt = `Analyze the following resume and provide a structured analysis in JSON format. Include:
  1. experience_level (Entry-level, Mid-level, Senior, etc.)
  2. key_skills (object with technical and soft skills arrays)
  3. suggested_roles (array of job titles)
  4. education (array of education entries)
  5. work_experience (summary of work history)
  6. strengths (array of key strengths)
  7. improvement_areas (array of suggested improvements)

  Resume:
  ${text.substring(0, 10000)}`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume analyzer. Provide a detailed analysis of the resume in valid JSON format. Ensure all fields are properly formatted.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    // Enhance the analysis with our calculated data
    return {
      ...analysis,
      ats_score: atsAnalysis.score,
      ats_feedback: atsAnalysis.feedback,
      summary: summary,
      last_analyzed: new Date().toISOString()
    };
  } catch (e) {
    console.error('Error parsing AI response:', e);
    // Fallback if JSON parsing fails
    return {
experience_level: 'Not specified',
      key_skills: { technical: [], soft: [] },
      suggested_roles: [],
      education: [],
      work_experience: 'Not specified',
      strengths: [],
      improvement_areas: [],
      ats_score: 0,
      ats_feedback: {
        positives: [],
        warnings: ['Error in analysis'],
        suggestions: ['Please try uploading your resume again'],
        keywordMatches: [],
        wordCount: 0
      },
      summary: summary,
      last_analyzed: new Date().toISOString(),
      raw_analysis: 'Error in analysis. Please try again.'
    };
  }
}

// Helper function to ask questions about resume
async function askAboutResume(question, resumeText) {
  const prompt = `Based on the following resume, answer the question. If the information is not in the resume, respond with "This information is not available in the resume."

  Resume:
  ${resumeText.substring(0, 8000)}

  Question: ${question}

  Answer:`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions based on the provided resume. Be concise and accurate.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama3-8b-8192',
    temperature: 0.3,
    max_tokens: 1024
  });

  return response.choices[0].message.content;
}

// Upload and analyze resume
router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = req.file.buffer;
    const data = await pdfParse(buffer);
    const text = data.text;
    const sessionId = req.body.sessionId || Date.now().toString();

    // Store the resume text
    resumeStore[sessionId] = text;

    // Analyze the resume
    const analysis = await analyzeResume(text);
    const summary = await generateResumeSummary(text);
    const atsScore = calculateATSScore(text);

    res.json({
      success: true,
      sessionId,
      analysis,
      summary,
      atsScore,
      text: text.substring(0, 500) + '...' // Return first 500 chars for preview
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    next(error);
  }
});

// Ask questions about the resume
router.post('/ask', express.json(), async (req, res, next) => {
  try {
    const { sessionId, question } = req.body;
    
    if (!sessionId || !question) {
      return res.status(400).json({ error: 'sessionId and question are required' });
    }

    const resumeText = resumeStore[sessionId];
    if (!resumeText) {
      return res.status(404).json({ error: 'Resume not found. Please upload a resume first.' });
    }

    const answer = await askAboutResume(question, resumeText);
    res.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    next(error);
  }
});

// Get resume analysis
router.get('/analyze/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const resumeText = resumeStore[sessionId];
    
    if (!resumeText) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const analysis = await analyzeResume(resumeText);
    const summary = await generateResumeSummary(resumeText);
    const atsScore = calculateATSScore(resumeText);

    res.json({
      success: true,
      analysis,
      summary,
      atsScore,
      text: resumeText.substring(0, 500) + '...'
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    next(error);
  }
});

// Clear resume session
router.delete('/clear/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  delete resumeStore[sessionId];
  res.json({ success: true, message: 'Session cleared' });
});

module.exports = router;
