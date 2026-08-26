interface ProgressBarProps {
  studied: number;
  total: number;
  learned: number;
}

export function ProgressBar({ studied, total, learned }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <div style={{
      padding: 'var(--sp-3) var(--sp-4)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      background: 'var(--surface-card)',
      flexShrink: 0,
    }}>
      {/* Thin progress bar */}
      <div style={{
        flex: 1,
        height: '4px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-inset)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-primary)',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--ink-tertiary)',
        whiteSpace: 'nowrap',
        minWidth: '80px',
        textAlign: 'right',
      }}>
        {learned}/{total}
      </span>
    </div>
  );
}
