import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
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

/* ════════════════════════════════════════════
   STUDY PAGE — Focused Learning Workspace
   ════════════════════════════════════════════ */

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
      setVisited([unlearned[0]]);
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
    setSelectedKey(key);
    setAnswered(true);
    const q = currentQuestion;
    if (!q) return;
    const isCorrect = key === q.correctKey;
    setIsWrong(!isCorrect);
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

    // If in the middle of history, just move forward
    if (historyIndex < visited.length - 1) {
      setHistoryIndex((i) => i + 1);
      const nextId = visited[historyIndex + 1];
      const nextQ = typedQuestions.find((qq) => qq.id === nextId);
      setSelectedKey(null);
      setAnswered(false);
      setIsWrong(false);
      // Advance queue past this question
      if (nextQ) {
        const up = progress.find((p) => p.id === q.id);
        const newBox = up?.box ?? 0;
        const newQueue = insertBackIntoQueue(queue, queueIndex, q.id, newBox, boxTable, progress);
        setQueue(newQueue);
        setQueueIndex(queueIndex);
      }
      return;
    }

    // At end of history — proceed normally
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
  }, [currentQuestion, progress, queue, queueIndex, boxTable, questionsAnswered, learnedCount, historyIndex, visited]);

  const handlePrev = useCallback(() => {
    if (historyIndex <= 0) return;
    setHistoryIndex((i) => i - 1);
    setSelectedKey(null);
    setAnswered(false);
    setIsWrong(false);
  }, [historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (!answered) {
        const keyMap: Record<string, string> = { '1': 'a', '2': 'b', '3': 'c', '4': 'd', a: 'a', b: 'b', c: 'c', d: 'd' };
        const mapped = keyMap[e.key.toLowerCase()];
        if (mapped) handleSelect(mapped);
        if (e.key === 'ArrowLeft') handlePrev();
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
        <MobileHeader title="Học" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={<Trophy size={24} />}
            title="Hoàn thành!"
            description={`Bạn đã thuộc ${learnedCount}/${typedQuestions.length} câu hỏi. Ôn lại thường xuyên để nhớ lâu.`}
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-2) var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <BookOpen size={15} color="var(--color-primary)" />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
              Học
            </span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
            {learnedCount}/{typedQuestions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: 'var(--bg-inset)', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Question area — single scrollable flow */}
      {currentQuestion && (
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-5) var(--space-4) var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          {/* Back button */}
          {historyIndex > 0 && (
            <button
              onClick={handlePrev}
              aria-label="Câu trước"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 0',
                width: 'fit-content',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <ChevronLeft size={14} />
              Câu trước
            </button>
          )}

          {/* Question number */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-primary)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
          }}>
            <div style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
            }} />
            CÂU {formatQuestionId(currentQuestion.id)}
          </div>

          {/* Question text — visual focus */}
          <div style={{
            fontSize: getQuestionFontSize(currentQuestion.question),
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--text-primary)',
            fontWeight: 'var(--weight-semibold)',
            maxWidth: '680px',
          }}>
            {currentQuestion.question}
          </div>

          {/* Options */}
          <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              width: 'fit-content',
            }}>
              Cần kiểm tra lại
            </div>
          )}

          {/* Feedback — flows directly after options */}
          {answered && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              paddingTop: 'var(--space-1)',
            }}>
              {/* Feedback message */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                color: isWrong ? 'var(--color-danger-text)' : 'var(--color-success-text)',
              }}>
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isWrong ? 'var(--color-danger)' : 'var(--color-success)',
                  flexShrink: 0,
                }} />
                {isWrong ? 'Sai' : 'Đúng'}
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  fontWeight: 'var(--weight-normal)',
                }}>
                  · liên tiếp {currentProgress?.correctStreak ?? 0}/{settings.streakToLearn}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={handleNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  background: 'var(--color-primary)',
                  color: 'var(--text-inverse)',
                  border: '1.5px solid var(--color-primary)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                  width: '100%',
                  minHeight: '42px',
                }}
              >
                Câu tiếp theo
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
