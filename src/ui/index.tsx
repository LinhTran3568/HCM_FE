import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

/* ════════════════════════════════════════════
   DESIGN SYSTEM — UI PRIMITIVES
   Modern Academic Learning App
   ════════════════════════════════════════════ */

// ── Shared styles ──
const S = {
  row: (gap = 'var(--space-2)'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap,
  }),
  col: (gap = 'var(--space-2)'): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap,
  }),
} as const;

/* ─── Button ─── */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  borderRadius: 'var(--radius-md)',
  fontWeight: 'var(--weight-semibold)' as never,
  lineHeight: 1,
  border: '1.5px solid transparent',
  transition: 'all var(--transition-fast)',
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer',
  userSelect: 'none' as const,
};

const btnSizes: Record<BtnSize, React.CSSProperties> = {
  sm: { padding: '7px 12px', fontSize: 'var(--text-sm)', minHeight: '32px' },
  md: { padding: '9px 18px', fontSize: 'var(--text-sm)', minHeight: '40px' },
  lg: { padding: '12px 24px', fontSize: 'var(--text-base)', minHeight: '48px' },
};

const btnVariants: Record<BtnVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--text-inverse)',
    borderColor: 'var(--color-primary)',
  },
  secondary: {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-default)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
  danger: {
    background: 'var(--color-danger-soft)',
    color: 'var(--color-danger-text)',
    borderColor: 'var(--color-danger)',
  },
};

export function Button({ variant = 'primary', size = 'md', fullWidth, icon, children, style, ...props }: ButtonProps) {
  return (
    <button
      style={{
        ...btnBase,
        ...btnSizes[size],
        ...btnVariants[variant],
        ...(fullWidth ? { width: '100%' } : {}),
        ...style,
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/* ─── Input ─── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Input({ label, hint, error, icon, fullWidth, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...(fullWidth ? { width: '100%' } : {}) }}>
      {label && (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '0 var(--space-3)',
        background: 'var(--bg-surface)',
        border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        minHeight: '40px',
        transition: 'border-color var(--transition-fast)',
      }}>
        {icon && <span style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>{icon}</span>}
        <input
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: '8px 0',
            fontSize: 'var(--text-base)',
            color: 'var(--text-primary)',
            minWidth: 0,
            ...style,
          }}
          {...props}
        />
      </div>
      {hint && !error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-text)' }}>{error}</span>}
    </div>
  );
}

/* ─── Card ─── */
interface CardProps {
  children: ReactNode;
  padding?: string;
  hoverable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, padding, hoverable, selected, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--border-light)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: padding ?? 'var(--space-4)',
        boxShadow: selected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
        transition: 'all var(--transition-fast)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = selected ? 'var(--color-primary)' : 'var(--border-strong)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = selected ? 'var(--color-primary)' : 'var(--border-light)';
          e.currentTarget.style.boxShadow = selected ? 'var(--shadow-sm)' : 'var(--shadow-xs)';
        }
      }}
    >
      {children}
    </div>
  );
}

/* ─── Badge ─── */
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const badgeColors: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--bg-inset)', color: 'var(--text-secondary)' },
  success: { bg: 'var(--color-success-soft)', color: 'var(--color-success-text)' },
  warning: { bg: 'var(--color-warning-soft)', color: 'var(--color-warning-text)' },
  danger: { bg: 'var(--color-danger-soft)', color: 'var(--color-danger-text)' },
  info: { bg: 'var(--color-info-soft)', color: 'var(--color-info)' },
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const c = badgeColors[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      background: c.bg,
      color: c.color,
      lineHeight: 1.4,
    }}>
      {children}
    </span>
  );
}

/* ─── StatCard ─── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
    }}>
      {icon && (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          background: color ? `${color}15` : 'var(--color-primary-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color ?? 'var(--color-primary)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--text-primary)',
        }}>
          {value}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── SectionHeader ─── */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
    }}>
      <div>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--weight-bold)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--text-primary)',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─── EmptyState ─── */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-12) var(--space-6)',
      textAlign: 'center',
      gap: 'var(--space-3)',
    }}>
      {icon && (
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--color-primary-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-2)',
        }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 'var(--leading-relaxed)' }}>
          {description}
        </div>
      )}
      {action}
    </div>
  );
}

/* ─── FilterChip ─── */
interface FilterChipProps {
  children: ReactNode;
  active?: boolean;
  count?: number;
  onClick: () => void;
}

export function FilterChip({ children, active, count, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-normal)',
        background: active ? 'var(--color-primary)' : 'var(--bg-surface)',
        color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--border-light)'}`,
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
      }}
    >
      {children}
      {count !== undefined && (
        <span style={{
          fontSize: 'var(--text-xs)',
          opacity: 0.7,
          marginLeft: '2px',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Skeleton ─── */
export function Skeleton({ width, height = '16px', radius }: { width?: string; height?: string; radius?: string }) {
  return (
    <div style={{
      width: width ?? '100%',
      height,
      borderRadius: radius ?? 'var(--radius-sm)',
      background: 'var(--bg-inset)',
    }} />
  );
}

/* ─── Helper: styles object ── */
export const styles = S;
