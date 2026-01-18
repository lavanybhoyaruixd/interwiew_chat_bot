import React from 'react';

export default function ResumeUploader({ onUpload }) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Upload your resume (TXT, PDF, or DOCX):</label>
      <input
        type="file"
        accept=".txt,application/pdf,.pdf,.docx"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
          }
        }}
        className="block w-full text-sm border border-gray-300 rounded p-2 bg-white"
      />
    </div>
  );
}
