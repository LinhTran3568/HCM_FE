import type { Option } from '../config/types';

interface OptionButtonProps {
  option: Option;
  index: number;
  selected: boolean;
  correct: boolean;
  showResult: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function OptionButton({ option, index, selected, correct, showResult, disabled, onClick }: OptionButtonProps) {
  let bg = 'var(--surface-card)';
  let border = 'var(--border-default)';
  let textColor = 'var(--ink-primary)';

  if (showResult) {
    if (correct) {
      bg = 'var(--color-correct-bg)';
      border = 'var(--color-correct-border)';
      textColor = 'var(--color-correct-text)';
    } else if (selected) {
      bg = 'var(--color-wrong-bg)';
      border = 'var(--color-wrong-border)';
      textColor = 'var(--color-wrong-text)';
    }
  }

  const label = String.fromCharCode(65 + index);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
        width: '100%',
        padding: 'var(--sp-3) var(--sp-4)',
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        minHeight: 'var(--option-min-height)',
        textAlign: 'left',
        color: textColor,
        fontSize: 'var(--text-base)',
        lineHeight: 1.5,
        transition: 'border-color 0.12s ease, background 0.12s ease',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        fontSize: 'var(--text-xs)',
        flexShrink: 0,
        background: showResult && correct
          ? 'var(--color-correct-text)'
          : 'var(--surface-inset)',
        color: showResult && correct ? 'var(--ink-inverse)' : 'var(--ink-secondary)',
      }}>
        {showResult && correct ? '✓' : label}
      </span>
      <span style={{ flex: 1 }}>{option.text}</span>
    </button>
  );
}
