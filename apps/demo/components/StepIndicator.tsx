'use client';

const PIPELINE_STAGES = [
  { label: 'AI Decision', sub: 'Model output' },
  { label: 'Hash & Sign', sub: 'KMS signature' },
  { label: 'On-Chain', sub: 'Blockchain anchor' },
  { label: 'Verify', sub: '3-layer check' },
  { label: 'Proof', sub: 'Audit artifact' },
] as const;

interface PipelineIndicatorProps {
  /** How many pipeline stages are complete (0–5) */
  completedStages: number;
  /** Which stage is currently active (-1 if none) */
  activeStage: number;
}

export function PipelineIndicator({ completedStages, activeStage }: PipelineIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center flex-wrap">
        {PIPELINE_STAGES.map((stage, i) => {
          const done = i < completedStages;
          const active = i === activeStage;

          const pillClass = done
            ? 'bg-emerald-100 border border-emerald-300 text-emerald-700 font-semibold'
            : active
              ? 'bg-[#0D5752] text-white font-semibold shadow-[0_2px_8px_rgba(13,87,82,0.35)]'
              : 'bg-[#E0F2F1] border border-[#B2DFDB] text-[#80A89E]';

          const prefix = done ? '✓ ' : active ? '● ' : '';

          return (
            <div key={stage.label} className="flex items-center">
              <span className={`rounded-full px-3 py-1 text-xs whitespace-nowrap transition-all ${pillClass}`}>
                {prefix}{stage.label}
              </span>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="h-px w-3 bg-[#B2DFDB] flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      {activeStage >= 0 && (
        <p className="text-[10px] text-[#5F9EA0] text-center mt-2">
          Step {activeStage + 1} of 5 — {PIPELINE_STAGES[activeStage].label}
        </p>
      )}
    </div>
  );
}
