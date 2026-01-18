import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeResume, uploadAndExtract } from '../services/resumeService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResumeUploader = ({ onAnalysisComplete, simpleUpload = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    await handleFileUpload(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/pdf',
    multiple: false,
    disabled: isUploading,
  });

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10);

    try {
      setProgress(30);
      
      // Use the appropriate API based on the component's mode
      const response = simpleUpload
        ? await uploadAndExtract(file, currentUser?.token)
        : await analyzeResume(file, currentUser?.token);
      
      setProgress(90);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data || response);
      }
      
      toast.success(
        simpleUpload 
          ? 'Resume uploaded successfully!'
          : 'Resume analysis complete!'
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error.message || 'Failed to process resume. Please try again.'
      );
    } finally {
      setProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="resume-uploader">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${
          isUploading ? 'uploading' : ''
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        {isUploading ? (
          <div className="upload-progress">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
            <span className="progress-text">
              {simpleUpload ? 'Uploading...' : 'Analyzing...'} {progress}%
            </span>
          </div>
        ) : (
          <div className="upload-prompt">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>
              {isDragActive
                ? 'Drop the resume here...'
                : 'Drag & drop your resume here, or click to select'}
            </p>
            <p className="small">
              Supported format: PDF (max {simpleUpload ? '5MB' : '10MB'})
            </p>
          </div>
        )}
      </div>
      
      {!isUploading && (
        <div className="text-center mt-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <i className="fas fa-file-upload me-2"></i>
            Select File
          </button>
        </div>
      )}
      
      <style jsx>{`
        .resume-uploader {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .dropzone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f8f9fa;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dropzone:hover, .dropzone.active {
          border-color: #0d6efd;
          background-color: #f0f7ff;
        }
        
        .upload-prompt {
          color: #6c757d;
        }
        
        .upload-prompt i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #0d6efd;
        }
        
        .upload-progress {
          width: 100%;
          position: relative;
        }
        
        .progress-bar {
          height: 8px;
          background-color: #0d6efd;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          display: block;
          margin-top: 0.5rem;
          font-weight: 500;
        }
        
        .small {
          font-size: 0.875rem;
          margin-top: 0.5rem;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default ResumeUploader;
