// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:32:45
// Current User's Login: NUbivek

"use client";

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Dynamically import heavy components with loading states
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.Prism),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded h-32"></div>
  }
);

const atomDark = dynamic(
  () => import('react-syntax-highlighter/dist/cjs/styles/prism').then(mod => mod.atomDark),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded h-4"></div>
  }
);

const CopyToClipboard = dynamic(
  () => import('react-copy-to-clipboard').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded w-6 h-6"></div>
  }
);

export default function SearchResults({ results, isSearching }) {
  const [copied, setCopied] = useState({});
  const [highlighterReady, setHighlighterReady] = useState(false);
  const timeoutRefs = useRef({});

  useEffect(() => {
    setHighlighterReady(true);
    const currentTimeouts = timeoutRefs.current;
    
    return () => {
      if (currentTimeouts) {
        Object.values(currentTimeouts).forEach(timeout => {
          if (timeout) clearTimeout(timeout);
        });
      }
    };
  }, []);

  const handleCopy = (id) => {
    setCopied(prev => ({ ...prev, [id]: true }));
    
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
    }
    
    timeoutRefs.current[id] = setTimeout(() => {
      setCopied(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  if (isSearching) {
    return (
      <div className="mt-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-slate-600">Searching through codebase...</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="mt-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const id = Math.random().toString(36).substr(2, 9);

                if (inline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm">
                      {children}
                    </code>
                  );
                }

                if (!highlighterReady) {
                  return (
                    <pre className="bg-slate-800 rounded-lg p-4">
                      <code className="text-slate-100">{children}</code>
                    </pre>
                  );
                }

                return (
                  <div className="relative group">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyToClipboard text={String(children)} onCopy={() => handleCopy(id)}>
                        <button
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            copied[id]
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {copied[id] ? 'Copied!' : 'Copy'}
                        </button>
                      </CopyToClipboard>
                    </div>
                    <SyntaxHighlighter
                      language={language}
                      style={atomDark}
                      customStyle={{
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        margin: '1.5rem 0'
                      }}
                      {...props}
                    >
                      {String(children).trim()}
                    </SyntaxHighlighter>
                  </div>
                );
              },
              p: ({ children }) => (
                <p className="mb-6 leading-relaxed text-slate-700">
                  {children}
                </p>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 mt-8 first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">
                  {children}
                </h3>
              ),
              a: ({ node, children, href }) => {
                const isFileLink = href?.startsWith('file://');
                return (
                  <a
                    href={isFileLink ? '#' : href}
                    target={isFileLink ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={(e) => {
                      if (isFileLink) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {children}
                  </a>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-6 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-slate-700">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 mb-6">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-slate-200">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2 bg-slate-50 text-left text-sm font-semibold text-slate-900">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 text-sm text-slate-700 border-t border-slate-100">
                  {children}
                </td>
              )
            }}
          >
            {results.answer}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}