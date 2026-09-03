import { useMemo } from 'react';
import { BookOpen, ArrowRight, Sparkles, Brain, Award, Layers, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import questions from '../data/questions.json';
import type { Question } from '../config/types';
import { loadProgress, ensureAllQuestionsHaveProgress } from '../storage/progressStorage';
import type { TabId } from '../config/types';

const typedQuestions = questions as Question[];

interface IntroPageProps {
  onEnter: (tab: TabId) => void;
}

export function IntroPage({ onEnter }: IntroPageProps) {
  const stats = useMemo(() => {
    const progress = ensureAllQuestionsHaveProgress(loadProgress(), typedQuestions.map((q) => q.id));
    const learned = progress.filter((p) => p.learned).length;
    const total = typedQuestions.length;
    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
    const boxCounts = [1, 2, 3, 4, 5].map((boxNum) => {
      if (boxNum === 1) {
        return progress.filter((p) => p.box <= 1 && !p.learned).length;
      }
      if (boxNum === 5) {
        return progress.filter((p) => p.learned || p.box >= 5).length;
      }
      return progress.filter((p) => p.box === boxNum && !p.learned).length;
    });
    return { learned, total, pct, boxCounts };
  }, []);

  return (
    <div className="animate-fade-in" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      padding: 'var(--space-2) 0 var(--space-8)',
    }}>
      {/* Hero Banner */}
      <div style={{
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        padding: 'var(--space-8) var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Glow background accent */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '150px',
          background: 'var(--color-primary-soft)',
          filter: 'blur(50px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-soft)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semibold)',
          marginBottom: 'var(--space-4)',
        }}>
          <Sparkles size={14} />
          Hệ Thống Ôn Luyện Lịch Sử Đảng Cộng sản Việt Nam — VNR201
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 'var(--leading-tight)',
          maxWidth: '640px',
          marginBottom: 'var(--space-3)',
        }}>
          Học Nhanh — Nhớ Lâu Với Thuật Toán <span style={{ color: 'var(--color-primary)' }}>Lặp Lại Ngắt Quãng</span>
        </h1>

        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-6)',
        }}>
          Ứng dụng thiết kế chuyên biệt cho môn học VNR201 giúp bạn ghi nhớ bền vững toàn bộ ngân hàng câu hỏi thông qua phương pháp Leitner SRS chuẩn hóa.
        </p>

        {/* Hero Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => onEnter('hoc')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: '12px 28px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-bold)',
              background: 'var(--color-primary-gradient)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: 'var(--shadow-glow)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <BookOpen size={18} />
            Bắt đầu học bài
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => onEnter('kiemtra')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              background: 'var(--bg-inset)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <ClipboardCheck size={18} />
            Thi thử ngẫu nhiên
          </button>
        </div>
      </div>

      {/* Progress & Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {/* Card 1: Total questions */}
        <div style={{
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
              Ngân hàng câu hỏi
            </span>
            <BookOpen size={18} color="var(--color-info)" />
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Câu hỏi trắc nghiệm chuẩn
          </div>
        </div>

        {/* Card 2: Learned count */}
        <div style={{
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
              Đã thành thục
            </span>
            <CheckCircle2 size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
            {stats.learned} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-muted)' }}>({stats.pct}%)</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Câu trả lời chính xác liên tiếp
          </div>
        </div>

        {/* Card 3: Memory box breakdown */}
        <div style={{
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>
              Phân bố Hộp Ghi nhớ
            </span>
            <Layers size={18} color="var(--color-warning)" />
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {stats.boxCounts.map((count, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: '24px',
                  borderRadius: 'var(--radius-xs)',
                  background: idx === 4 ? 'var(--color-primary-soft)' : 'var(--bg-inset)',
                  border: `1px solid ${idx === 4 ? 'var(--color-primary)' : 'var(--border-light)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'var(--weight-bold)',
                  color: idx === 4 ? 'var(--color-primary)' : 'var(--text-secondary)',
                }}>
                  {count}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>H{idx + 1}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Hộp 5: Cấp độ đã ghi nhớ vững chắc
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
          Tính Năng Nổi Bật
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {/* Feature 1 */}
          <div style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            gap: 'var(--space-4)',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Brain size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Thuật toán Leitner SRS
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                Tự động điều chỉnh tần suất lặp lại dựa trên độ thuộc của bạn. Câu làm sai sẽ xuất hiện lại sớm hơn, câu đã thuộc sẽ giảm tần suất ôn.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            gap: 'var(--space-4)',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-info-soft)',
              color: 'var(--color-info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Xem Lại Lịch Sử Câu Hỏi
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                Hỗ trợ nút "Câu trước" (`[←]`) và "Câu tiếp" (`[→]`) để bạn dễ dàng rà soát lại các câu đã trả lời trong phiên học bài mà không mất tiến trình.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            gap: 'var(--space-4)',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-warning-soft)',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Award size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Thi Thử Mô Phỏng
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                Tạo đề kiểm tra trắc nghiệm ngẫu nhiên có tính thời gian, lưu lại lịch sử bài thi và phân tích điểm số chi tiết để đánh giá năng lực.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

