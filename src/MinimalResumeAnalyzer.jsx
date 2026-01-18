import { useState } from 'react';

export default function MinimalResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [length, setLength] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const base = import.meta.env.VITE_RESUME_API_BASE_URL || 'http://localhost:5000';

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be < 5MB');
      return;
    }
    setError('');
    setFile(f);
    setPreview('');
    setLength(0);
    setAnswer('');
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setAnswer('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await fetch(`${base}/upload`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || `Upload failed (${res.status})`);
      }
      setPreview(data.preview || '');
      setLength(data.length || 0);
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const ask = async () => {
    setBusy(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch(`${base}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data) throw new Error(data?.message || `Ask failed (${res.status})`);
      if (data.error) throw new Error(data.error);
      setAnswer(data.answer || '');
    } catch (e) {
      setError(e.message || 'Ask failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: 16 }}>
      <h1>Minimal Resume Analyzer (Port 5000)</h1>
      <p>Uploads a PDF, stores text in memory, then answers questions using Groq.</p>

      <div style={{ marginTop: 16 }}>
        <input type="file" accept="application/pdf" onChange={onFileChange} />
        <button onClick={upload} disabled={!file || busy} style={{ marginLeft: 8 }}>
          {busy ? 'Working…' : 'Upload PDF'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'tomato', marginTop: 12 }}>⚠️ {error}</div>
      )}

      {(preview || length) ? (
        <div style={{ marginTop: 16 }}>
          <h3>Preview (first 200 chars)</h3>
          <pre style={{ background: '#111', color: '#0ff', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{preview}</pre>
          <div>Length: {length} chars</div>
        </div>
      ) : null}

      <div style={{ marginTop: 24 }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the resume"
          style={{ width: '70%', padding: 8 }}
        />
        <button onClick={ask} disabled={!question.trim() || busy} style={{ marginLeft: 8 }}>
          {busy ? 'Working…' : 'Ask'}
        </button>
      </div>

      {answer && (
        <div style={{ marginTop: 16 }}>
          <h3>Answer</h3>
          <div style={{ background: '#0b132b', color: 'white', padding: 12, borderRadius: 6 }}>{answer}</div>
        </div>
      )}

      <div style={{ marginTop: 24, opacity: 0.7 }}>
        <div>Backend: {base}</div>
      </div>
    </div>
  );
}
