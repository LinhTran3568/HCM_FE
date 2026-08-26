import { useMemo } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import questions from '../data/questions.json';
import type { Question } from '../config/types';
import { loadProgress, ensureAllQuestionsHaveProgress } from '../storage/progressStorage';
import type { TabId } from '../config/types';

const typedQuestions = questions as Question[];

interface IntroPageProps {
  onEnter: (tab: TabId) => void;
}

/* ════════════════════════════════════════════
   INTRO / WELCOME PAGE
   First screen when opening the app
   ════════════════════════════════════════════ */

export function IntroPage({ onEnter }: IntroPageProps) {
  const stats = useMemo(() => {
    const progress = ensureAllQuestionsHaveProgress(loadProgress(), typedQuestions.map((q) => q.id));
    const learned = progress.filter((p) => p.learned).length;
    const total = typedQuestions.length;
    return { learned, total };
  }, []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8) var(--space-6)',
      textAlign: 'center',
      minHeight: '100dvh',
    }}>
      {/* Logo mark */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--color-primary-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <BookOpen size={28} color="var(--color-primary)" strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-2)',
      }}>
        HCM202
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--text-secondary)',
        maxWidth: '360px',
        lineHeight: 'var(--leading-relaxed)',
        marginBottom: 'var(--space-8)',
      }}>
        Tư tưởng Hồ Chí Minh — Ứng dụng học tập với lặp lại ngắt quãng
      </p>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-10)',
      }}>
        <div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
          }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            câu hỏi
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--border-light)' }} />
        <div>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-primary)',
          }}>
            {stats.learned}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            đã thuộc
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onEnter('hoc')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          padding: '12px 32px',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--weight-semibold)',
          background: 'var(--color-primary)',
          color: 'var(--text-inverse)',
          border: '1.5px solid var(--color-primary)',
          transition: 'all var(--transition-fast)',
          cursor: 'pointer',
          minHeight: '48px',
        }}
      >
        Bắt đầu học
        <ArrowRight size={18} />
      </button>

      {/* Hint */}
      <p style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        marginTop: 'var(--space-4)',
      }}>
        Nhấn Enter để bắt đầu
      </p>
    </div>
  );
}
