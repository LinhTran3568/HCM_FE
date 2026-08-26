import { useState, useMemo } from 'react';
import { Search, ChevronRight, Check, AlertCircle } from 'lucide-react';
import questions from '../data/questions.json';
import type { Question } from '../config/types';
import { loadProgress, ensureAllQuestionsHaveProgress } from '../storage/progressStorage';
import { Badge, FilterChip, Input, EmptyState } from '../ui/index';
import { MobileHeader } from '../ui/Navigation';

const typedQuestions = questions as Question[];

type Filter = 'all' | 'learned' | 'unlearned' | 'review';

/* ════════════════════════════════════════════
   QUESTION BANK PAGE — Professional browsing UI
   ════════════════════════════════════════════ */

export function ToanBoPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const progress = useMemo(() => {
    return ensureAllQuestionsHaveProgress(loadProgress(), typedQuestions.map((q) => q.id));
  }, []);

  const stats = useMemo(() => {
    const learned = progress.filter((p) => p.learned).length;
    const review = typedQuestions.filter((q) => q.needsReview).length;
    return { learned, unlearned: progress.length - learned, review, total: typedQuestions.length };
  }, [progress]);

  const filtered = useMemo(() => {
    let list = typedQuestions;

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter((q) => q.question.toLowerCase().includes(term));
    }

    if (filter === 'learned') {
      list = list.filter((q) => progress.find((p) => p.id === q.id)?.learned);
    } else if (filter === 'unlearned') {
      list = list.filter((q) => {
        const p = progress.find((p) => p.id === q.id);
        return p && !p.learned;
      });
    } else if (filter === 'review') {
      list = list.filter((q) => q.needsReview);
    }

    return list;
  }, [search, filter, progress]);

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: stats.total },
    { key: 'learned', label: 'Đã thuộc', count: stats.learned },
    { key: 'unlearned', label: 'Chưa thuộc', count: stats.unlearned },
    { key: 'review', label: 'Cần KT', count: stats.review },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Mobile header */}
      <MobileHeader title="Toàn bộ câu hỏi" subtitle={`${stats.total} câu hỏi`} />

      {/* Sticky filter bar */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-page)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Search */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Input
            icon={<Search size={16} />}
            placeholder="Tìm câu hỏi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto' }}>
          {FILTERS.map((f) => (
            <FilterChip key={f.key} active={filter === f.key} count={f.count} onClick={() => setFilter(f.key)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Question list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={20} />}
            title="Không tìm thấy"
            description="Thử từ khoá khác hoặc đổi bộ lọc."
          />
        ) : (
          <div>
            {filtered.map((q) => {
              const isExpanded = expandedId === q.id;
              const p = progress.find((p) => p.id === q.id);
              const accuracy = p && p.totalSeen > 0 ? Math.round((p.totalCorrect / p.totalSeen) * 100) : null;

              return (
                <div key={q.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                      background: isExpanded ? 'var(--bg-inset)' : 'transparent',
                      minHeight: '52px',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    {/* Question ID + status indicator */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0, paddingTop: '2px' }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--weight-semibold)',
                        color: p?.learned ? 'var(--color-success)' : 'var(--text-muted)',
                      }}>
                        {q.id}
                      </span>
                      {p?.learned ? (
                        <Check size={12} color="var(--color-success)" />
                      ) : q.needsReview ? (
                        <AlertCircle size={12} color="var(--color-warning)" />
                      ) : null}
                    </div>

                    {/* Question text */}
                    <span style={{
                      flex: 1,
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--leading-relaxed)',
                      color: 'var(--text-primary)',
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? undefined : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: isExpanded ? undefined : 'hidden',
                    }}>
                      {q.question}
                    </span>

                    {/* Metadata + chevron */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0, paddingTop: '2px' }}>
                      {accuracy !== null && (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          color: accuracy >= 80 ? 'var(--color-success-text)' : accuracy >= 50 ? 'var(--color-warning-text)' : 'var(--color-danger-text)',
                          fontWeight: 'var(--weight-medium)',
                        }}>
                          {accuracy}%
                        </span>
                      )}
                      <ChevronRight
                        size={14}
                        color="var(--text-muted)"
                        style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                          transition: 'transform 0.15s ease',
                        }}
                      />
                    </div>
                  </button>

                  {/* Expanded answer list */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 var(--space-4) var(--space-4) calc(var(--space-4) + 12px + var(--space-3))',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)',
                    }}>
                      {q.options.map((opt) => {
                        const isCorrect = opt.key === q.correctKey;
                        return (
                          <div
                            key={opt.key}
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--text-sm)',
                              lineHeight: 'var(--leading-relaxed)',
                              background: isCorrect ? 'var(--color-success-soft)' : 'var(--bg-surface)',
                              color: isCorrect ? 'var(--color-success-text)' : 'var(--text-secondary)',
                              fontWeight: isCorrect ? 'var(--weight-medium)' : 'var(--weight-normal)',
                              border: `1px solid ${isCorrect ? 'var(--color-success)' : 'var(--border-light)'}`,
                            }}
                          >
                            {isCorrect && <Check size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />}
                            {opt.key.toUpperCase()}. {opt.text}
                          </div>
                        );
                      })}

                      {/* Progress bar for this question */}
                      {p && p.totalSeen > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          marginTop: 'var(--space-1)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-muted)',
                        }}>
                          <span>Đã thấy {p.totalSeen} lần</span>
                          <span>·</span>
                          <span style={{ color: 'var(--color-success-text)' }}>{p.totalCorrect} đúng</span>
                          <span style={{ color: 'var(--color-danger-text)' }}>{p.totalWrong} sai</span>
                          <span>·</span>
                          <span>Hộp {p.box}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
