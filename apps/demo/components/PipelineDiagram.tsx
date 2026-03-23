'use client';

const stages = [
  { label: 'AI Decision', desc: 'Model output' },
  { label: 'Hash & Sign', desc: 'KMS signature' },
  { label: 'On-Chain', desc: 'Blockchain anchor' },
  { label: 'Verify', desc: '3-layer check' },
  { label: 'Proof', desc: 'Audit artifact' },
];

export function PipelineDiagram() {
  return (
    <div className="flex items-center flex-wrap py-2">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center">
          <span className="rounded-full px-3 py-1 text-xs bg-[#E0F2F1] border border-[#B2DFDB] text-[#80A89E] whitespace-nowrap">
            {stage.label}
          </span>
          {i < stages.length - 1 && (
            <div className="h-px w-3 bg-[#B2DFDB] flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
