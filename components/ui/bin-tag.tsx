import { cn } from '@/lib/utils';

/**
 * BinTag — renders a code (SKU, OEM, VIN, reference) the way it would
 * appear on a physical warehouse bin label: uppercase mono type inside
 * a hairline rectangle with one clipped corner. Used everywhere a part
 * code appears so the eye learns to scan for it the same way across
 * every page.
 */
export function BinTag({
  children,
  className,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'neutral' | 'accent';
}) {
  return (
    <span
      className={cn(
        'bin-tag inline-flex items-center border px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide leading-none',
        tone === 'neutral' && 'border-border bg-background-2 text-foreground/80',
        tone === 'accent' && 'border-primary/30 bg-primary/10 text-primary',
        className
      )}
    >
      {children}
    </span>
  );
}

const STOCK_TONES = {
  in_stock: { label: 'En stock', dot: 'bg-success', text: 'text-success', bg: 'bg-success-bg' },
  low_stock: { label: 'Stock faible', dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning-bg' },
  out_of_stock: { label: 'Rupture', dot: 'bg-danger', text: 'text-danger', bg: 'bg-danger-bg' },
} as const;

/**
 * StockTag — the same bin-tag device, specialised as a stock-light
 * status readout (square dot + uppercase mono label) instead of a
 * generic rounded pill.
 */
export function StockTag({ status, className }: { status: keyof typeof STOCK_TONES; className?: string }) {
  const t = STOCK_TONES[status];
  return (
    <span
      className={cn(
        'bin-tag inline-flex items-center gap-1.5 border border-border px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide leading-none',
        t.bg,
        t.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0', t.dot)} />
      {t.label}
    </span>
  );
}
