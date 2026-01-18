import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };
  return (
    <button
      onClick={onCopy}
      aria-label="Copy code"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        padding: '4px 8px',
        fontSize: 12,
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.06)',
        color: '#e5e7eb',
        cursor: 'pointer'
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// Adds a small language badge to fenced code blocks
function LanguageBadge({ className }) {
  const match = /language-(\w+)/.exec(className || '');
  if (!match) return null;
  const label = match[1].toUpperCase();
  const bg = label === 'JS' || label === 'JAVASCRIPT' ? '#f59e0b' :
             label === 'TS' || label === 'TYPESCRIPT' ? '#60a5fa' :
             label === 'PY' || label === 'PYTHON' ? '#22c55e' : '#94a3b8';
  return (
    <span style={{
      position: 'absolute', top: 8, left: 8,
      padding: '2px 6px', fontSize: 11, borderRadius: 6,
      background: bg, color: '#0b1020', fontWeight: 700
    }}>{label}</span>
  );
}

export default function MarkdownView({ children }) {
  return (
    <div className="formatted-bot-message markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ inline, className, children, ...props }) {
            // const language = /language-(\w+)/.exec(className || '')?.[1]; // not used yet
            if (inline) {
              return (
                <code
                  className={className}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    padding: '2px 6px',
                    borderRadius: 6,
                    color: '#e5e7eb'
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const text = String(children).replace(/\n$/, '');
            return (
              <div style={{ position: 'relative' }}>
                <LanguageBadge className={className} />
                <CopyButton text={text} />
                <pre className={className} style={{
                  background: 'rgba(17, 24, 39, 0.85)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '34px 14px 14px 14px', /* top padding increased to avoid overlap */
                  overflowX: 'auto'
                }}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          li: ({ children }) => {
            // Convert children to string to inspect for existing emoji
            const raw = React.Children.toArray(children).map(c =>
              typeof c === 'string' ? c : (c.props?.children || '')
            ).join(' ').trim();
            const hasEmoji = /^([\p{Emoji}_*]|:[a-z_-]+:)/u.test(raw);
            // Simple keyword-based emoji mapping
            const lower = raw.toLowerCase();
            let emoji = '✅';
            if (/\btips?\b|improve|best practice/.test(lower)) emoji = '💡';
            else if (/design|architecture|pattern/.test(lower)) emoji = '🧱';
            else if (/security|auth|encrypt|token|jwt|secure/.test(lower)) emoji = '🔐';
            else if (/performance|optimi|speed|fast/.test(lower)) emoji = '🚀';
            else if (/error|bug|issue|fix/.test(lower)) emoji = '🛠️';
            else if (/learn|study|reading|docs|documentation/.test(lower)) emoji = '📚';
            else if (/data|analytics|ml|ai|model/.test(lower)) emoji = '🧠';
            else if (/career|role|job|position|salary|offer/.test(lower)) emoji = '🎯';
            return (
              <li style={{ marginTop: 4, marginBottom: 4 }}>
                {hasEmoji ? children : <>{emoji} {children}</>}
              </li>
            );
          },
          p: ({ children }) => <p style={{ marginTop: 8, marginBottom: 8, lineHeight: 1.6 }}>{children}</p>,
          strong: ({ children }) => <strong style={{ color: '#00ffe1' }}>{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: '3px solid rgba(255,255,255,0.2)',
              paddingLeft: 12,
              color: 'rgba(255,255,255,0.85)'
            }}>
              {children}
            </blockquote>
          ),
          hr: () => <hr style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '14px 0' }} />
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
