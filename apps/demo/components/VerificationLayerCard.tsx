'use client';

import { Card, CardContent } from '@/components/ui/card';

interface VerificationLayerCardProps {
  title: string;
  pass: boolean;
  details: Record<string, string | number | boolean | null>;
}

export function VerificationLayerCard({ title, pass, details }: VerificationLayerCardProps) {
  return (
    <Card className="border border-[#E0F2F1] overflow-hidden">
      <div className={`border-l-4 ${pass ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-bold ${pass ? 'text-emerald-600' : 'text-red-500'}`}>
              {pass ? '✓' : '✗'}
            </span>
            <span className="font-semibold text-sm">{title}</span>
          </div>
          <dl className="space-y-1">
            {Object.entries(details)
              .filter(([, value]) => value != null)
              .map(([key, value]) => (
                <div key={key} className="flex gap-2 text-xs">
                  <dt className="text-muted-foreground min-w-[100px]">{key}:</dt>
                  <dd className="font-mono break-all">{String(value)}</dd>
                </div>
              ))}
          </dl>
        </CardContent>
      </div>
    </Card>
  );
}
