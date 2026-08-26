import type { Question } from '../config/types';
import { OptionButton } from './OptionButton';

interface QuestionCardProps {
  question: Question;
  answered: boolean;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onNext: () => void;
  streak: number;
  streakToLearn: number;
  isWrong: boolean;
}

function getQuestionFontSize(text: string): string {
  if (text.length > 300) return '0.875rem';
  if (text.length > 200) return '0.9375rem';
  return 'var(--text-base)';
}

export function QuestionCard({ question, answered, selectedKey, onSelect, onNext, streak, streakToLearn, isWrong }: QuestionCardProps) {
  const isCorrectAnswer = answered && selectedKey === question.correctKey;
  const qFontSize = getQuestionFontSize(question.question);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
      height: '100%',
    }}>
      {/* Scrollable content area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--sp-5) var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
      }}>
        {/* Question number tag */}
        <div style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--ink-tertiary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Câu {question.id}
        </div>

        {/* Question text */}
        <div style={{
          fontSize: qFontSize,
          lineHeight: 1.65,
          color: 'var(--ink-primary)',
        }}>
          {question.question}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {question.options.map((opt, i) => (
            <OptionButton
              key={opt.key}
              option={opt}
              index={i}
              selected={selectedKey === opt.key}
              correct={answered && opt.key === question.correctKey}
              showResult={answered}
              disabled={answered}
              onClick={() => onSelect(opt.key)}
            />
          ))}
        </div>

        {question.needsReview && (
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-warning)',
            padding: 'var(--sp-1) var(--sp-2)',
            background: 'var(--surface-inset)',
            borderRadius: 'var(--radius-sm)',
            width: 'fit-content',
          }}>
            Cần kiểm tra lại
          </div>
        )}
      </div>

      {/* Bottom action area */}
      <div style={{
        padding: 'var(--sp-3) var(--sp-4)',
        borderTop: '1px solid var(--border-default)',
        background: 'var(--surface-card)',
        flexShrink: 0,
      }}>
        {answered ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: isCorrectAnswer ? 'var(--color-correct-text)' : 'var(--color-wrong-text)',
              fontWeight: 500,
            }}>
              {isCorrectAnswer
                ? `Đúng — liên tiếp ${streak}/${streakToLearn}`
                : 'Sai — quay lại từ đầu'}
            </div>
            <button
              onClick={onNext}
              style={{
                padding: 'var(--sp-3)',
                background: 'var(--color-primary)',
                color: 'var(--ink-inverse)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                width: '100%',
                minHeight: '48px',
              }}
            >
              Câu tiếp theo →
            </button>
          </div>
        ) : (
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-tertiary)',
            textAlign: 'center',
          }}>
            Chọn một đáp án
          </div>
        )}
      </div>
    </div>
  );
}
