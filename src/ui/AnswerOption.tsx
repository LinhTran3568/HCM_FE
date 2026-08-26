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

  if (showResult) {
    if (correct) {
      bg = 'var(--color-success-soft)';
      border = 'var(--color-success)';
      textColor = 'var(--color-success-text)';
      labelBg = 'var(--color-success)';
      labelColor = 'var(--text-inverse)';
    } else if (selected) {
      bg = 'var(--color-danger-soft)';
      border = 'var(--color-danger)';
      textColor = 'var(--color-danger-text)';
      labelBg = 'var(--color-danger)';
      labelColor = 'var(--text-inverse)';
    }
  } else if (selected) {
    bg = 'var(--color-primary-soft)';
    border = 'var(--color-primary)';
    textColor = 'var(--color-primary-dark)';
    labelBg = 'var(--color-primary)';
    labelColor = 'var(--text-inverse)';
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
        padding: 'var(--space-3)',
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        textAlign: 'left',
        color: textColor,
        fontSize: 'var(--text-base)',
        lineHeight: 'var(--leading-normal)',
        transition: 'all var(--transition-fast)',
        cursor: disabled ? 'default' : 'pointer',
        minHeight: 'var(--option-min-height)',
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        borderRadius: 'var(--radius-sm)',
        background: labelBg,
        color: labelColor,
        fontWeight: 'var(--weight-semibold)',
        fontSize: 'var(--text-xs)',
        flexShrink: 0,
        marginTop: '1px',
        transition: 'all var(--transition-fast)',
      }}>
        {showResult && correct ? <Check size={13} strokeWidth={2.5} /> : label}
      </span>
      <span style={{ flex: 1, paddingTop: '2px' }}>{option.text}</span>
    </button>
  );
}
