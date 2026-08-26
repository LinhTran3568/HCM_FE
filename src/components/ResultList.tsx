import type { Question } from '../config/types';
import { FilterChip, Badge } from '../ui/index';

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
    <div style={{ padding: 'var(--space-5) var(--space-4)' }}>
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
          border: '1px solid transparent',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-success-text)',
          }}>
            {correctCount}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-text)', marginTop: '2px', opacity: 0.8 }}>Đúng</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-danger-soft)',
          border: '1px solid transparent',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-danger-text)',
          }}>
            {wrongCount}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-text)', marginTop: '2px', opacity: 0.8 }}>Sai</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }}>
        <FilterChip active={filter === 'all'} count={total} onClick={() => onFilterChange('all')}>
          Tất cả
        </FilterChip>
        <FilterChip active={filter === 'wrong'} count={wrongCount} onClick={() => onFilterChange('wrong')}>
          Sai
        </FilterChip>
      </div>

      {/* Answer list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {filtered.map((a, i) => {
          const q = questions.find((q) => q.id === a.questionId);
          if (!q) return null;
          return (
            <div key={i} style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid',
              borderColor: a.correct ? 'var(--color-success)' : 'var(--color-danger)',
              background: a.correct ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <Badge variant={a.correct ? 'success' : 'danger'} size="sm">
                  {a.correct ? 'Đúng' : 'Sai'}
                </Badge>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)' }}>
                  Câu {q.id}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                {q.question}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bạn: </span>
                <span style={{
                  color: a.correct ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                  fontWeight: 'var(--weight-medium)',
                }}>
                  {q.options.find((o) => o.key === a.selected)?.text ?? a.selected}
                </span>
              </div>
              {!a.correct && (
                <div style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginTop: 'var(--space-1)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Đáp án: </span>
                  <span style={{ color: 'var(--color-success-text)', fontWeight: 'var(--weight-medium)' }}>
                    {q.correctText}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
