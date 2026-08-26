import type { Question } from '../config/types';
import { FilterChip, Badge } from '../ui/index';
import { AnswerOption } from '../ui/AnswerOption';

interface Answer {
  questionId: number;
  selected: string;
  correct: boolean;
}

interface ResultListProps {
  questions: Question[];
  answers: Answer[];
  filter: 'all' | 'wrong';
  onFilterChange: (f: 'all' | 'wrong') => void;
}

export function ResultList({ questions, answers, filter, onFilterChange }: ResultListProps) {
  const total = answers.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const wrongCount = total - correctCount;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const filtered = filter === 'wrong' ? answers.filter((a) => !a.correct) : answers;

  return (
    <div style={{ padding: 'var(--space-5) var(--space-4)', maxWidth: '720px', margin: '0 auto' }}>
      {/* Score summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
      }}>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: pct >= 60 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
          }}>
            {pct}%
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>Điểm số</div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-success-soft)',
          border: '1px solid var(--color-success)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-success-text)',
          }}>
            {correctCount}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-text)', marginTop: '2px', fontWeight: 'var(--weight-medium)' }}>Chính xác</div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-danger-soft)',
          border: '1px solid var(--color-danger)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-danger-text)',
          }}>
            {wrongCount}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-text)', marginTop: '2px', fontWeight: 'var(--weight-medium)' }}>Chưa đúng</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-5)',
      }}>
        <FilterChip active={filter === 'all'} count={total} onClick={() => onFilterChange('all')}>
          Tất cả ({total})
        </FilterChip>
        <FilterChip active={filter === 'wrong'} count={wrongCount} onClick={() => onFilterChange('wrong')}>
          Các câu sai ({wrongCount})
        </FilterChip>
      </div>

      {/* Answer list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {filtered.map((a, i) => {
          const q = questions.find((q) => q.id === a.questionId);
          if (!q) return null;
          return (
            <div key={i} style={{
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: `1.5px solid ${a.correct ? 'var(--color-success)' : 'var(--color-danger)'}`,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Badge variant={a.correct ? 'success' : 'danger'} size="sm">
                    {a.correct ? 'Đúng' : 'Sai'}
                  </Badge>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
                    CÂU {q.id}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-primary)', fontWeight: 'var(--weight-semibold)' }}>
                {q.question}
              </div>

              {/* Display ALL options with user selection and correct key highlight */}
              <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {q.options.map((opt, idx) => {
                  const isUserSelected = a.selected === opt.key;
                  const isCorrectAnswer = q.correctKey === opt.key;

                  return (
                    <AnswerOption
                      key={opt.key}
                      option={opt}
                      index={idx}
                      selected={isUserSelected}
                      correct={isCorrectAnswer}
                      showResult={true}
                      disabled={true}
                      onClick={() => {}}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

