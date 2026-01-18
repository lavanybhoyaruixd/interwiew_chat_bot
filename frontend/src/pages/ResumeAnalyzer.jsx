import React, { useState } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import ResumeUploader from '../components/ResumeUploader';
import ResumeAnalysis from '../components/ResumeAnalysis';
import { analyzeResume } from '../services/resumeService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResumeAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleAnalysisComplete = (result) => {
    setAnalysis(result);
    setError('');
    // Scroll to analysis section
    setTimeout(() => {
      const element = document.getElementById('analysis-results');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const handleError = (error) => {
    setError(error.message || 'An error occurred while analyzing the resume.');
    console.error('Analysis error:', error);
  };

  const handleAnalyzeAnother = () => {
    setAnalysis(null);
    setError('');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <div className="text-center mb-5">
            <h1 className="display-4 mb-3">Resume Analysis</h1>
            <p className="lead text-muted">
              Upload your resume to get instant feedback and improve your job application
            </p>
          </div>

          {!analysis ? (
            <div className="mb-5">
              <ResumeUploader
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Analysis Results</h2>
                <Button 
                  variant="outline-primary" 
                  onClick={handleAnalyzeAnother}
                >
                  <i className="fas fa-redo me-2"></i>
                  Analyze Another Resume
                </Button>
              </div>
              <div id="analysis-results">
                <ResumeAnalysis analysis={analysis} />
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-top">
            <h3 className="h4 mb-3">How It Works</h3>
            <Row>
              <Col md={4} className="mb-4">
                <div className="text-center p-3 h-100">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-upload fa-2x text-primary"></i>
                  </div>
                  <h4>1. Upload</h4>
                  <p className="text-muted">Upload your resume in PDF format.</p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="text-center p-3 h-100">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-robot fa-2x text-primary"></i>
                  </div>
                  <h4>2. Analyze</h4>
                  <p className="text-muted">Our AI analyzes your resume in seconds.</p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="text-center p-3 h-100">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-chart-line fa-2x text-primary"></i>
                  </div>
                  <h4>3. Improve</h4>
                  <p className="text-muted">Get actionable feedback to improve your resume.</p>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .resume-analyzer {
          min-height: calc(100vh - 200px);
          padding-top: 2rem;
          padding-bottom: 4rem;
        }
        
        .feature-icon {
          font-size: 2.5rem;
          color: #0d6efd;
          margin-bottom: 1rem;
        }
        
        .upload-section {
          background-color: #f8f9fa;
          border-radius: 0.5rem;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px dashed #dee2e6;
        }
      `}</style>
    </Container>
  );
};

export default ResumeAnalyzer;
