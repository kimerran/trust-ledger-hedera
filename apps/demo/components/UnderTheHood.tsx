'use client';

import { useState } from 'react';

interface UnderTheHoodProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function UnderTheHood({ children, defaultOpen = false }: UnderTheHoodProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-4 border border-[#B2DFDB] rounded-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#5F9EA0] hover:text-[#0D5752] hover:bg-[#F0FAFA] transition-colors rounded-md"
      >
        <span>Under the Hood</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#B2DFDB] pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
