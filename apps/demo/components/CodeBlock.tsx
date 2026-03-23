'use client';

import { useState } from 'react';

interface CodeBlockProps {
  title?: string;
  language?: string;
  children: string;
}

export function CodeBlock({ title, language = 'json', children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border border-[#B2DFDB] overflow-hidden">
      {title && (
        <div className="px-3 py-1.5 border-b border-[#B2DFDB] bg-[#E0F2F1] text-[#0D5752] text-xs font-medium flex items-center justify-between">
          <span>
            {title}{language && <span className="text-[#80A89E] ml-1">({language})</span>}
          </span>
          <button
            onClick={handleCopy}
            className="px-2 py-0.5 rounded text-[10px] font-medium border border-[#B2DFDB] bg-white hover:bg-[#F0FAFA] transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-3 overflow-x-auto text-xs leading-relaxed bg-[#F0FAFA]">
        <code>{children}</code>
      </pre>
    </div>
  );
}
