import { useState } from 'react';
import { API_BASE } from './api/base';
import './resumeAnalyzer.css';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selected);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('hiremate_token');

      const response = await fetch(`${API_BASE}/api/interview/upload-resume?method=memory`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('hiremate_token');

      const response = await fetch(`${API_BASE}/api/resume/analyze`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="resume-analyzer">
      <div className="analyzer-container">
        <h1 className="analyzer-title">Resume Analyzer</h1>
        <p className="analyzer-subtitle">Upload your resume and get AI-powered insights</p>

        {!result ? (
          <div className="upload-section">
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                />
                <div className="file-input-button">
                  📄 Choose PDF File
                </div>
              </label>
              {file && (
                <div className="file-selected">
                  <span className="file-name">✓ {file.name}</span>
                  <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {file && !error && (
              <div className="action-buttons">
                <button
                  onClick={handleUpload}
                  disabled={uploading || analyzing}
                  className="btn btn-primary"
                >
                  {uploading ? 'Uploading...' : '🚀 Upload & Process'}
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={uploading || analyzing}
                  className="btn btn-secondary"
                >
                  {analyzing ? 'Analyzing...' : '🔍 Analyze Resume'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <button onClick={reset} className="btn btn-small">
                Upload Another
              </button>
            </div>

            {/* Resume Data */}
            {result.resumeData && (
              <div className="result-card">
                <h3>📋 Resume Summary</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">File Name:</span>
                    <span className="info-value">{result.resumeData.filename}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Current Role:</span>
                    <span className="info-value">{result.resumeData.currentRole || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Experience:</span>
                    <span className="info-value">{result.resumeData.yearsOfExperience || '0'} years</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Industries:</span>
                    <span className="info-value">
                      {result.resumeData.industries?.join(', ') || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {result.resumeData?.skills && result.resumeData.skills.length > 0 && (
              <div className="result-card">
                <h3>💡 Skills Detected ({result.resumeData.skills.length})</h3>
                <div className="skills-grid">
                  {result.resumeData.skills.map((skill, idx) => (
                    <span key={idx} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Achievements */}
            {result.resumeData?.keyAchievements && result.resumeData.keyAchievements.length > 0 && (
              <div className="result-card">
                <h3>🏆 Key Achievements</h3>
                <ul className="achievements-list">
                  {result.resumeData.keyAchievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sample Questions */}
            {result.sampleQuestions && result.sampleQuestions.length > 0 && (
              <div className="result-card">
                <h3>❓ Sample Interview Questions</h3>
                <div className="questions-list">
                  {result.sampleQuestions.map((q, idx) => (
                    <div key={idx} className="question-item">
                      <div className="question-header">
                        <span className="question-number">Q{idx + 1}</span>
                        <span className="question-difficulty">{q.difficulty || 'medium'}</span>
                      </div>
                      <p className="question-text">{q.question}</p>
                      {q.category && (
                        <span className="question-category">{q.category}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Summary */}
            {result.resumeData?.processingSummary && (
              <div className="result-card">
                <h3>📊 Processing Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Text Length:</span>
                    <span className="summary-value">{result.resumeData.processingSummary.textLength} chars</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Skills Found:</span>
                    <span className="summary-value">{result.resumeData.processingSummary.totalSkills}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Has Experience:</span>
                    <span className="summary-value">
                      {result.resumeData.processingSummary.hasExperience ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Has Education:</span>
                    <span className="summary-value">
                      {result.resumeData.processingSummary.hasEducation ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics */}
            {result.analytics && (
              <div className="result-card analytics-card">
                <h3>⚡ Analytics</h3>
                <div className="analytics-grid">
                  <div className="analytics-item">
                    <span className="analytics-label">Processing Method:</span>
                    <span className="analytics-value">{result.analytics.processingMethod}</span>
                  </div>
                  <div className="analytics-item">
                    <span className="analytics-label">Skills Found:</span>
                    <span className="analytics-value">{result.analytics.skillsFound}</span>
                  </div>
                  <div className="analytics-item">
                    <span className="analytics-label">Processing Time:</span>
                    <span className="analytics-value">{result.analytics.processingTime}ms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {result.preview && (
              <div className="result-card">
                <h3>👀 Quick Preview</h3>
                <div className="preview-grid">
                  <div className="preview-item">
                    <strong>Current Role:</strong> {result.preview.currentRole || 'N/A'}
                  </div>
                  <div className="preview-item">
                    <strong>Experience:</strong> {result.preview.yearsOfExperience || '0'} years
                  </div>
                  <div className="preview-item">
                    <strong>Skills:</strong> {result.preview.skills?.join(', ') || 'None detected'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
