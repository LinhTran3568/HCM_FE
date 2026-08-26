import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, ChevronRight, Trophy, RotateCcw, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import questions from '../data/questions.json';
import type { Question, CardProgress } from '../config/types';
import { loadProgress, saveProgress, ensureAllQuestionsHaveProgress } from '../storage/progressStorage';
import { useTheme } from '../theme/ThemeContext';
import { buildBoxTable } from '../config/srsConfig';
import { processAnswer, insertBackIntoQueue, shouldInsertReview, pickReviewQuestions } from '../srs/srsEngine';
import { AnswerOption } from '../ui/AnswerOption';
import { Button, EmptyState } from '../ui/index';
import { MobileHeader } from '../ui/Navigation';

const typedQuestions = questions as Question[];

function getQuestionFontSize(text: string): string {
  if (text.length > 300) return 'var(--text-base)';
  if (text.length > 200) return 'var(--text-lg)';
  return 'var(--text-xl)';
}

function formatQuestionId(id: number): string {
  return id.toString().padStart(2, '0');
}

export function HocPage() {
  const { settings } = useTheme();
  const [progress, setProgress] = useState<CardProgress[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [visited, setVisited] = useState<number[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [userAnswers, setUserAnswers] = useState<Record<number, { selectedKey: string; isWrong: boolean }>>({});
  const initialized = useRef(false);

  const boxTable = buildBoxTable(settings.baseDistance, settings.streakToLearn);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const loaded = ensureAllQuestionsHaveProgress(loadProgress(), typedQuestions.map((q) => q.id));
    setProgress(loaded);
    const unlearned = loaded
      .filter((p) => !p.learned && typedQuestions.some((q) => q.id === p.id && q.correctKey))
      .sort((a, b) => (a.box !== b.box ? a.box - b.box : a.lastSeenAt - b.lastSeenAt));
    setQueue(unlearned.map((p) => p.id));
    setQueueIndex(0);
    if (unlearned.length > 0) {
      setVisited([unlearned[0].id]);
      setHistoryIndex(0);
    }
  }, []);

  const currentQuestion = visited.length > 0 && historyIndex >= 0 && historyIndex < visited.length
    ? typedQuestions.find((q) => q.id === visited[historyIndex]) ?? null
    : null;

  const currentProgress = currentQuestion ? progress.find((p) => p.id === currentQuestion.id) : null;
  const learnedCount = progress.filter((p) => p.learned).length;
  const progressPct = typedQuestions.length > 0 ? Math.round((learnedCount / typedQuestions.length) * 100) : 0;

  const handleSelect = useCallback((key: string) => {
    if (answered) return;
    const q = currentQuestion;
    if (!q) return;

    setSelectedKey(key);
    setAnswered(true);
    const isCorrect = key === q.correctKey;
    const wrongState = !isCorrect;
    setIsWrong(wrongState);

    // Save answer state for history navigation
    setUserAnswers((prev) => ({
      ...prev,
      [q.id]: { selectedKey: key, isWrong: wrongState }
    }));

    setProgress((prev) => {
      const pIdx = prev.findIndex((p) => p.id === q.id);
      if (pIdx === -1) return prev;
      const updated = processAnswer(prev[pIdx], isCorrect, boxTable, settings.streakToLearn);
      const next = [...prev];
      next[pIdx] = updated;
      saveProgress(next);
      return next;
    });
    setQuestionsAnswered((prev) => prev + 1);
  }, [answered, currentQuestion, boxTable, settings.streakToLearn]);

  const handleNext = useCallback(() => {
    const q = currentQuestion;
    if (!q) return;

    // If reviewing in the middle of history, just step forward
    if (historyIndex < visited.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextId = visited[nextIdx];
      setHistoryIndex(nextIdx);

      const saved = userAnswers[nextId];
      if (saved) {
        setSelectedKey(saved.selectedKey);
        setAnswered(true);
        setIsWrong(saved.isWrong);
      } else {
        setSelectedKey(null);
        setAnswered(false);
        setIsWrong(false);
      }

      const nextQ = typedQuestions.find((qq) => qq.id === nextId);
      if (nextQ) {
        const up = progress.find((p) => p.id === q.id);
        const newBox = up?.box ?? 0;
        const newQueue = insertBackIntoQueue(queue, queueIndex, q.id, newBox, boxTable, progress);
        setQueue(newQueue);
        setQueueIndex(queueIndex);
      }
      return;
    }

    // At end of history — proceed to new question in queue
    const updatedProgress = progress.find((p) => p.id === q.id);
    const newBox = updatedProgress?.box ?? 0;
    let newQueue = insertBackIntoQueue(queue, queueIndex, q.id, newBox, boxTable, progress);
    if (shouldInsertReview(questionsAnswered, learnedCount)) {
      const reviewIds = pickReviewQuestions(progress, 5);
      for (let i = reviewIds.length - 1; i >= 0; i--) {
        const pos = Math.min(queueIndex + 60, newQueue.length);
        newQueue.splice(pos, 0, reviewIds[i]);
      }
    }
    setQueue(newQueue);
    setQueueIndex(queueIndex);

    // Append next question to history
    if (queueIndex + 1 < newQueue.length) {
      setVisited((v) => [...v, newQueue[queueIndex + 1]]);
      setHistoryIndex((i) => i + 1);
    } else {
      setVisited((v) => [...v, q.id]);
      setHistoryIndex((i) => i + 1);
    }

    setSelectedKey(null);
    setAnswered(false);
    setIsWrong(false);
  }, [currentQuestion, progress, queue, queueIndex, boxTable, questionsAnswered, learnedCount, historyIndex, visited, userAnswers]);

  const handlePrev = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    const prevId = visited[prevIdx];
    setHistoryIndex(prevIdx);

    const saved = userAnswers[prevId];
    if (saved) {
      setSelectedKey(saved.selectedKey);
      setAnswered(true);
      setIsWrong(saved.isWrong);
    } else {
      setSelectedKey(null);
      setAnswered(false);
      setIsWrong(false);
    }
  }, [historyIndex, visited, userAnswers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
        return;
      }
      if (!answered) {
        const keyMap: Record<string, string> = { '1': 'a', '2': 'b', '3': 'c', '4': 'd', a: 'a', b: 'b', c: 'c', d: 'd' };
        const mapped = keyMap[e.key.toLowerCase()];
        if (mapped) handleSelect(mapped);
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answered, handleSelect, handleNext, handlePrev]);

  /* ── Empty state ── */
  if (queue.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MobileHeader title="Học bài" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={<Trophy size={28} color="var(--color-primary)" />}
            title="Tuyệt vời! Bạn đã hoàn thành bài học!"
            description={`Bạn đã thuộc ${learnedCount}/${typedQuestions.length} câu hỏi. Hãy duy trì ôn lại định kỳ.`}
            action={
              <Button
                variant="primary"
                size="md"
                icon={<RotateCcw size={16} />}
                onClick={() => {
                  setQueue(progress.filter((p) => !p.learned).map((p) => p.id));
                  setQueueIndex(0);
                }}
              >
                Ôn lại tất cả
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  /* ── Main study view ── */
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOpen size={16} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                Không gian Học tập
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Hệ thống lặp lại ngắt quãng Leitner
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-inset)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
            }}>
              Đã thuộc: <strong style={{ color: 'var(--color-primary)' }}>{learnedCount}</strong>/{typedQuestions.length} ({progressPct}%)
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--bg-inset)', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'var(--color-primary-gradient)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Main question workspace container */}
      {currentQuestion && (
        <div className="animate-fade-in" style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}>
          {/* Controls Bar: Câu trước / Stepper / Câu tiếp */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--border-light)',
          }}>
            {/* Back button */}
            <button
              onClick={handlePrev}
              disabled={historyIndex <= 0}
              aria-label="Câu trước"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: historyIndex > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                background: historyIndex > 0 ? 'var(--bg-inset)' : 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
                opacity: historyIndex > 0 ? 1 : 0.4,
                transition: 'all var(--transition-fast)',
              }}
            >
              <ArrowLeft size={14} />
              <span>Câu trước</span>
              <kbd style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
              }}>←</kbd>
            </button>

            {/* Stepper info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-primary)',
                letterSpacing: '0.05em',
                background: 'var(--color-primary-soft)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                CÂU {formatQuestionId(currentQuestion.id)}
              </span>
              {currentProgress && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Layers size={12} /> Hộp {currentProgress.box + 1}
                </span>
              )}
            </div>

            {/* Next button in review mode */}
            {historyIndex < visited.length - 1 && (
              <button
                onClick={handleNext}
                aria-label="Câu tiếp theo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-inverse)',
                  background: 'var(--color-primary-gradient)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>Câu tiếp</span>
                <kbd style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFF',
                }}>→</kbd>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Question title & body */}
          <div style={{
            fontSize: getQuestionFontSize(currentQuestion.question),
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--text-primary)',
            fontWeight: 'var(--weight-semibold)',
            letterSpacing: '-0.01em',
          }}>
            {currentQuestion.question}
          </div>

          {/* Answer Options */}
          <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            {currentQuestion.options.map((opt, i) => (
              <AnswerOption
                key={opt.key}
                option={opt}
                index={i}
                selected={selectedKey === opt.key}
                correct={answered && opt.key === currentQuestion.correctKey}
                showResult={answered}
                disabled={answered}
                onClick={() => handleSelect(opt.key)}
              />
            ))}
          </div>

          {currentQuestion.needsReview && (
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-warning-text)',
              background: 'var(--color-warning-soft)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              width: 'fit-content',
              fontWeight: 'var(--weight-medium)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              ⚠️ Câu hỏi này được đánh dấu cần ôn lại
            </div>
          )}

          {/* Feedback & Action area */}
          {answered && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              background: isWrong ? 'var(--color-danger-soft)' : 'var(--color-success-soft)',
              border: `1px solid ${isWrong ? 'var(--color-danger)' : 'var(--color-success)'}`,
              marginTop: 'var(--space-2)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-bold)',
                  color: isWrong ? 'var(--color-danger-text)' : 'var(--color-success-text)',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isWrong ? 'var(--color-danger)' : 'var(--color-success)',
                    boxShadow: `0 0 8px ${isWrong ? 'var(--color-danger)' : 'var(--color-success)'}`,
                  }} />
                  {isWrong ? 'Trả lời chưa chính xác' : 'Chính xác! Hoàn hảo!'}
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Chuỗi đúng: <strong>{currentProgress?.correctStreak ?? 0}</strong>/{settings.streakToLearn}
                </div>
              </div>

              {/* Next Question CTA */}
              <button
                onClick={handleNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-bold)',
                  background: 'var(--color-primary-gradient)',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>Câu tiếp theo</span>
                <kbd style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#FFF',
                }}>Enter ↵</kbd>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

