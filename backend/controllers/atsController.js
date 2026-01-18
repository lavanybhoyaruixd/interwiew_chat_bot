/* eslint-env node */
/* global module, require, process */
const aiService = require('../services/aiService');
const { setResumeText } = require('../services/resumeContext');
const logger = require('../utils/logger');

/**
 * Analyze resume for ATS compatibility using Groq AI
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Optional job description for matching
 * @returns {Promise<Object>} ATS score breakdown
 */
async function analyzeATSScore(resumeText, jobDescription = '') {
  try {
    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a comprehensive analysis in well-formatted Markdown.

Resume:
${resumeText.substring(0, 8000)}

${jobDescription ? `Job Description:\n${jobDescription.substring(0, 2000)}` : ''}

Please provide a detailed ATS analysis with the following sections:

## 📊 ATS Score Overview
- **Overall Score**: [0-100]/100
- **Formatting Score**: [0-100]/100 (readability, structure)
- **Keywords Score**: [0-100]/100 (relevant terms found)
- **Skills Score**: [0-100]/100 (technical competencies)
- **Experience Score**: [0-100]/100 (work history relevance)

## 🎯 Best Fit Job Roles
1. [Primary recommended role based on experience]
2. [Secondary role option]
3. [Alternative career paths]
4. [Entry-level positions if applicable]

## ✅ Skills Matched

### Technical Skills
- [List of technical skills found in resume]

### Soft Skills
- [List of soft skills identified]

### Tools & Technologies
- [List of tools, frameworks, and technologies mentioned]

## ⚠️ Weak Areas / Missing Skills
- [Skills or competencies that are missing or underdeveloped]
- [Areas that need improvement based on industry standards]
- [Gaps identified in the resume]

## 💡 Suggestions to Improve Resume
- [Specific, actionable recommendations]
- [Tips for better ATS optimization]
- [Content and formatting improvements]
- [Additional sections or information to include]

## 🏆 Strengths
- [Key strengths of the resume]
- [What makes this candidate competitive]
- [Unique selling points]

## 🔧 Areas for Improvement
- [Specific areas that need work]
- [Priority improvements to make]
- [Long-term development suggestions]

Format your response using proper Markdown with headings, bullet points, and bold text for readability. Be specific and provide actionable insights based on the resume content.`;

    const response = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS resume analyzer. Provide comprehensive, well-formatted Markdown analysis with specific insights and actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';
    
    if (!content) {
      throw new Error('No response from AI service');
    }

    return content;
  } catch (error) {
    logger.error('ATS analysis error:', error);
    // Fallback formatted response if AI fails
    return `# ATS Analysis Error

## 📊 ATS Score Overview
- **Overall Score**: 50/100
- **Formatting Score**: 50/100
- **Keywords Score**: 50/100
- **Skills Score**: 50/100
- **Experience Score**: 50/100

## ⚠️ Analysis Error
Unable to perform full AI analysis. Please try again.

## 💡 Suggestions to Improve Resume
- Ensure resume is in text format (not image-based PDF)
- Include standard sections (Experience, Education, Skills)
- Use relevant keywords for your target industry
- Keep formatting simple and clean`;
  }
}

/**
 * Controller: Analyze resume ATS score
 */
async function analyzeResume(req, res) {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Valid resume text is required (minimum 50 characters)'
      });
    }

    logger.info('Analyzing ATS score for resume');
    
    const atsAnalysis = await analyzeATSScore(resumeText, jobDescription);

    res.json({
      success: true,
      data: atsAnalysis,
      message: 'ATS analysis completed successfully'
    });
  } catch (error) {
    logger.error('ATS controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { analyzeResume, analyzeATSScore };
