import type { Option } from '../config/types';
import { Check } from 'lucide-react';

/* ════════════════════════════════════════════
   ANSWER OPTION — reusable across Study + Test
   ════════════════════════════════════════════ */

interface AnswerOptionProps {
  option: Option;
  index: number;
  selected: boolean;
  correct: boolean;
  showResult: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function AnswerOption({ option, index, selected, correct, showResult, disabled, onClick }: AnswerOptionProps) {
  const label = String.fromCharCode(65 + index);

  let bg = 'var(--bg-surface)';
  let border = 'var(--border-light)';
  let textColor = 'var(--text-primary)';
  let labelBg = 'var(--bg-inset)';
  let labelColor = 'var(--text-muted)';
  let shadow = 'var(--shadow-xs)';

  if (showResult) {
    if (correct) {
      bg = 'var(--color-success-soft)';
      border = 'var(--color-success)';
      textColor = 'var(--color-success-text)';
      labelBg = 'var(--color-success)';
      labelColor = '#FFFFFF';
      shadow = '0 0 12px rgba(16, 185, 129, 0.2)';
    } else if (selected) {
      bg = 'var(--color-danger-soft)';
      border = 'var(--color-danger)';
      textColor = 'var(--color-danger-text)';
      labelBg = 'var(--color-danger)';
      labelColor = '#FFFFFF';
      shadow = '0 0 12px rgba(239, 68, 68, 0.2)';
    }
  } else if (selected) {
    bg = 'var(--color-primary-soft)';
    border = 'var(--color-primary)';
    textColor = 'var(--text-primary)';
    labelBg = 'var(--color-primary)';
    labelColor = '#FFFFFF';
    shadow = 'var(--shadow-glow)';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="radio"
      aria-checked={selected}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        width: '100%',
        padding: 'var(--space-3) var(--space-4)',
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 'var(--radius-lg)',
        textAlign: 'left',
        color: textColor,
        fontSize: 'var(--text-base)',
        lineHeight: 'var(--leading-normal)',
        transition: 'all var(--transition-fast)',
        cursor: disabled ? 'default' : 'pointer',
        minHeight: 'var(--option-min-height)',
        boxShadow: shadow,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.background = 'var(--bg-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.borderColor = border;
          e.currentTarget.style.background = bg;
        }
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: 'var(--radius-md)',
        background: labelBg,
        color: labelColor,
        fontWeight: 'var(--weight-bold)',
        fontSize: 'var(--text-xs)',
        flexShrink: 0,
        marginTop: '1px',
        transition: 'all var(--transition-fast)',
        boxShadow: 'var(--shadow-xs)',
      }}>
        {showResult && correct ? <Check size={14} strokeWidth={3} /> : label}
      </span>
      <span style={{ flex: 1, paddingTop: '2px', fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-normal)' }}>{option.text}</span>
    </button>
  );
}
