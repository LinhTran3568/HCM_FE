import { useState, useCallback } from 'react';
import { ClipboardCheck, Play, ChevronLeft, ChevronRight, CheckCircle, Send } from 'lucide-react';
import questions from '../data/questions.json';
import type { Question } from '../config/types';
import { loadProgress, ensureAllQuestionsHaveProgress } from '../storage/progressStorage';
import { addTestResult } from '../storage/settingsStorage';
import { useTheme } from '../theme/ThemeContext';
import { buildBoxTable } from '../config/srsConfig';
import { processAnswer } from '../srs/srsEngine';
import { AnswerOption } from '../ui/AnswerOption';
import { Button, Card, Input, FilterChip } from '../ui/index';
import { MobileHeader } from '../ui/Navigation';
import { ResultList } from '../components/ResultList';

const typedQuestions = questions as Question[];
type Phase = 'setup' | 'test' | 'result';

interface Answer {
  questionId: number;
  selected: string;
  correct: boolean;
}

/* ════════════════════════════════════════════
   TEST PAGE — Exam Setup + Exam Interface
   ════════════════════════════════════════════ */

export function KiemTraPage() {
  const { settings } = useTheme();
  const [phase, setPhase] = useState<Phase>('setup');
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswersMap, setUserAnswersMap] = useState<Record<number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Answer[]>([]);
  const [resultFilter, setResultFilter] = useState<'all' | 'wrong'>('all');
  const [customCount, setCustomCount] = useState('');
  const [source, setSource] = useState<'all' | 'unlearned' | 'learned'>('all');

  const boxTable = buildBoxTable(settings.baseDistance, settings.streakToLearn);

  const getPool = useCallback((src: 'all' | 'unlearned' | 'learned') => {
    if (src === 'all') return typedQuestions.filter((q) => q.correctKey);
    const prog = ensureAllQuestionsHaveProgress(loadProgress(), typedQuestions.map((q) => q.id));
    if (src === 'unlearned') {
      return typedQuestions.filter((q) => {
        if (!q.correctKey) return false;
        const p = prog.find((p) => p.id === q.id);
        return p && !p.learned;
      });
    }
    return typedQuestions.filter((q) => {
      if (!q.correctKey) return false;
      const p = prog.find((p) => p.id === q.id);
      return p && p.learned;
    });
  }, []);

  const startTest = useCallback((count: number, src: 'all' | 'unlearned' | 'learned') => {
    const pool = getPool(src);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    if (selected.length === 0) { alert('Không có câu hỏi phù hợp.'); return; }
    setTestQuestions(selected);
    setCurrentIndex(0);
    setUserAnswersMap({});
    setSubmittedAnswers([]);
    setPhase('test');
  }, [getPool]);

  const handleStart = useCallback(() => {
    const n = parseInt(customCount, 10);
    if (!n || n < 1) { alert('Nhập số câu hỏi hợp lệ.'); return; }
    startTest(n, source);
  }, [customCount, source, startTest]);

  const handleSelect = useCallback((key: string) => {
    const q = testQuestions[currentIndex];
    if (!q) return;

    setUserAnswersMap((prev) => ({
      ...prev,
      [q.id]: key,
    }));
  }, [testQuestions, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, testQuestions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(() => {
    const answeredCount = Object.keys(userAnswersMap).length;
    if (answeredCount < testQuestions.length) {
      if (!window.confirm(`Bạn mới trả lời ${answeredCount}/${testQuestions.length} câu hỏi. Bạn chắc chắn muốn nộp bài?`)) {
        return;
      }
    }

    const calculatedAnswers: Answer[] = testQuestions.map((q) => {
      const selected = userAnswersMap[q.id] || '';
      const isCorrect = selected === q.correctKey;
      return {
        questionId: q.id,
        selected,
        correct: isCorrect,
      };
    });

    // Update SRS progress for answered questions
    const prog = ensureAllQuestionsHaveProgress(loadProgress(), typedQuestions.map((q) => q.id));
    calculatedAnswers.forEach((ans) => {
      if (ans.selected) {
        const pIdx = prog.findIndex((p) => p.id === ans.questionId);
        if (pIdx !== -1) {
          prog[pIdx] = processAnswer(prog[pIdx], ans.correct, boxTable, settings.streakToLearn);
        }
      }
    });
    try { localStorage.setItem('hcm202_progress_v1', JSON.stringify(prog)); } catch { /* */ }

    addTestResult({
      date: new Date().toISOString(),
      total: testQuestions.length,
      correct: calculatedAnswers.filter((a) => a.correct).length,
      answers: calculatedAnswers,
    });

    setSubmittedAnswers(calculatedAnswers);
    setPhase('result');
  }, [userAnswersMap, testQuestions, boxTable, settings.streakToLearn]);

  /* ── SETUP PHASE ── */
  if (phase === 'setup') {
    const pool = getPool(source);
    const QUICK_COUNTS = [10, 20, 50, 100];

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MobileHeader title="Kiểm tra" subtitle="Tự kiểm tra kiến thức" />

        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-5) var(--space-4)' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Source selector */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                Nguồn câu hỏi
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' as const }}>
                {([
                  { key: 'all' as const, label: 'Tất cả', count: typedQuestions.filter((q) => q.correctKey).length },
                  { key: 'unlearned' as const, label: 'Chưa thuộc' },
                  { key: 'learned' as const, label: 'Đã thuộc' },
                ]).map((opt) => (
                  <FilterChip key={opt.key} active={source === opt.key} count={opt.count} onClick={() => setSource(opt.key)}>
                    {opt.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                Số câu hỏi
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    type="number"
                    min={1}
                    max={pool.length}
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                    placeholder={`Tối đa ${pool.length}`}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
                  />
                </div>
                <Button variant="primary" size="lg" onClick={handleStart} icon={<Play size={16} />}>
                  Bắt đầu
                </Button>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                Nhập số tuỳ ý hoặc chọn nhanh bên dưới
              </p>
            </div>

            {/* Quick presets */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                Chọn nhanh
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                {QUICK_COUNTS.map((n) => (
                  <Card
                    key={n}
                    hoverable
                    onClick={() => startTest(n, source)}
                    style={{ textAlign: 'center' as const, padding: 'var(--space-4)' }}
                  >
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>{n}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>câu hỏi</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Info card */}
            <Card style={{ background: 'var(--color-info-soft)', borderColor: 'var(--color-info)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-info)', lineHeight: 'var(--leading-relaxed)' }}>
                Kết quả kiểm tra sẽ cập nhật tiến độ học tập. Câu trả lời đúng/sai đều được ghi nhận vào hệ thống lặp lại ngắt quãng.
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT PHASE ── */
  if (phase === 'result') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MobileHeader
          title="Kết quả Kiểm tra"
          action={
            <Button variant="secondary" size="sm" onClick={() => setPhase('setup')}>
              Làm đề khác
            </Button>
          }
        />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ResultList
            questions={typedQuestions}
            answers={submittedAnswers}
            filter={resultFilter}
            onFilterChange={setResultFilter}
          />
        </div>
      </div>
    );
  }

  /* ── TEST PHASE ── */
  const currentQ = testQuestions[currentIndex];
  const answeredCount = Object.keys(userAnswersMap).length;
  const progressPct = Math.round(((currentIndex + 1) / testQuestions.length) * 100);
  const selectedKey = currentQ ? userAnswersMap[currentQ.id] || null : null;
  const isLastQuestion = currentIndex === testQuestions.length - 1;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              Câu {currentIndex + 1}/{testQuestions.length}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-inset)',
              color: 'var(--text-muted)',
              fontWeight: 'var(--weight-medium)'
            }}>
              Đã làm: {answeredCount}/{testQuestions.length}
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={handleSubmit} icon={<Send size={14} />}>
            Nộp bài
          </Button>
        </div>
        <div style={{ height: '4px', borderRadius: 'var(--radius-full)', background: 'var(--bg-inset)', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'var(--color-primary-gradient)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Question area */}
      {currentQ && (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-6) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
            maxWidth: '680px',
            width: '100%',
            margin: '0 auto',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-primary)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />
              CÂU {currentQ.id}
            </div>

            <div style={{
              fontSize: 'var(--text-lg)',
              lineHeight: 'var(--leading-relaxed)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
            }}>
              {currentQ.question}
            </div>

            <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              {currentQ.options.map((opt, i) => (
                <AnswerOption
                  key={opt.key}
                  option={opt}
                  index={i}
                  selected={selectedKey === opt.key}
                  correct={false}
                  showResult={false}
                  disabled={false}
                  onClick={() => handleSelect(opt.key)}
                />
              ))}
            </div>
          </div>

          {/* Bottom nav */}
          <div style={{
            padding: 'var(--space-4) var(--space-5)',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-surface)',
            flexShrink: 0,
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.04)',
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', maxWidth: '680px', margin: '0 auto' }}>
              <Button
                variant="secondary"
                fullWidth
                onClick={handlePrev}
                disabled={currentIndex === 0}
                icon={<ChevronLeft size={16} />}
              >
                Trước
              </Button>

              {isLastQuestion ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmit}
                  icon={<CheckCircle size={16} />}
                >
                  Nộp bài & Xem kết quả
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleNext}
                  icon={<ChevronRight size={16} />}
                >
                  Tiếp
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

