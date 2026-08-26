import { useRef } from 'react';
import { Settings, Palette, Type, Sliders, BarChart3, Database, Trash2, Download, Upload, Moon, Sun, Monitor } from 'lucide-react';
import questions from '../data/questions.json';
import type { Question } from '../config/types';
import { useTheme } from '../theme/ThemeContext';
import { loadProgress, ensureAllQuestionsHaveProgress } from '../storage/progressStorage';
import { exportData, importData, clearAllData } from '../storage/settingsStorage';
import { Button, Card, Input, StatCard } from '../ui/index';
import { MobileHeader } from '../ui/Navigation';

const typedQuestions = questions as Question[];

/* ════════════════════════════════════════════
   SETTINGS PAGE — Grouped, professional settings
   ════════════════════════════════════════════ */

export function CaiDatPage() {
  const { settings, updateSettings } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progress = ensureAllQuestionsHaveProgress(loadProgress(), typedQuestions.map((q) => q.id));
  const learnedCount = progress.filter((p) => p.learned).length;

  const last7Days = (() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = settings.dailyHistory.find((h) => h.date === dateStr);
      days.push({ date: dateStr, count: entry?.studied ?? 0 });
    }
    return days;
  })();

  const maxDaily = Math.max(...last7Days.map((d) => d.count), 1);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hcm202_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (importData(reader.result)) {
          window.location.reload();
        } else {
          alert('File không hợp lệ');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!window.confirm('Xóa toàn bộ tiến độ học?')) return;
    if (!window.confirm('Xác nhận lần cuối — không thể hoàn tác.')) return;
    clearAllData();
    window.location.reload();
  };

  const Section = ({ title, icon: IconComp, children }: { title: string; icon?: typeof Settings; children: React.ReactNode }) => (
    <section>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-3)',
      }}>
        {IconComp && <IconComp size={14} color="var(--text-muted)" />}
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.06em',
        }}>
          {title}
        </span>
      </div>
      {children}
    </section>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MobileHeader title="Cài đặt" />

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--space-5) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
      }}>
        {/* ── Stats overview ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          <StatCard label="Đã thuộc" value={learnedCount} icon={<BarChart3 size={18} />} color="var(--color-success)" />
          <StatCard label="Chưa thuộc" value={typedQuestions.length - learnedCount} icon={<BarChart3 size={18} />} color="var(--color-primary)" />
          <StatCard label="Tổng câu" value={typedQuestions.length} icon={<BarChart3 size={18} />} color="var(--text-muted)" />
        </div>

        {/* ── Theme ── */}
        <Section title="Giao diện" icon={Palette}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {([
              { key: 'light' as const, label: 'Sáng', icon: Sun },
              { key: 'dark' as const, label: 'Tối', icon: Moon },
              { key: 'system' as const, label: 'Hệ thống', icon: Monitor },
            ]).map((opt) => {
              const Icon = opt.icon;
              const isActive = settings.theme === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => updateSettings({ theme: opt.key })}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-normal)',
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-surface)',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: `1.5px solid ${isActive ? 'var(--color-primary)' : 'var(--border-light)'}`,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={18} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Font size ── */}
        <Section title="Cỡ chữ" icon={Type}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {([
              { key: 'small' as const, label: 'Nhỏ' },
              { key: 'medium' as const, label: 'Vừa' },
              { key: 'large' as const, label: 'Lớn' },
              { key: 'xlarge' as const, label: 'Rất lớn' },
            ]).map((opt) => {
              const isActive = settings.fontSize === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => updateSettings({ fontSize: opt.key })}
                  style={{
                    flex: 1,
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-normal)',
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-surface)',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: `1.5px solid ${isActive ? 'var(--color-primary)' : 'var(--border-light)'}`,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── SRS Parameters ── */}
        <Section title="Tham số học tập" icon={Sliders}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Khoảng cách lặp lại khi sai</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Số câu giữa các lần ôn lại
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={settings.baseDistance}
                    onChange={(e) => updateSettings({ baseDistance: Number(e.target.value) || 3 })}
                    style={{ width: '64px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>câu</span>
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--border-light)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Số lần đúng liên tiếp để thuộc</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Đạt đủ số lần → chuyển sang chế độ ôn tập
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Input
                    type="number"
                    min={2}
                    max={20}
                    value={settings.streakToLearn}
                    onChange={(e) => updateSettings({ streakToLearn: Number(e.target.value) || 5 })}
                    style={{ width: '64px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>lần</span>
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* ── Activity chart ── */}
        <Section title="Hoạt động 7 ngày" icon={BarChart3}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', marginBottom: 'var(--space-3)' }}>
              {last7Days.map((d) => (
                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '28px',
                    height: `${Math.max((d.count / maxDaily) * 50, 3)}px`,
                    background: d.count > 0 ? 'var(--color-primary)' : 'var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    opacity: d.count > 0 ? 0.8 : 0.5,
                    transition: 'height 0.2s ease',
                  }} />
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {d.date.slice(8)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>{last7Days[0]?.date.slice(5)}</span>
              <span>{last7Days[6]?.date.slice(5)}</span>
            </div>
          </Card>
        </Section>

        {/* ── Data ── */}
        <Section title="Dữ liệu" icon={Database}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" fullWidth onClick={handleExport} icon={<Download size={16} />}>
              Xuất file
            </Button>
            <Button variant="secondary" fullWidth onClick={handleImport} icon={<Upload size={16} />}>
              Nhập file
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Nguy hiểm" icon={Trash2}>
          <Button variant="danger" fullWidth onClick={handleReset} icon={<Trash2 size={16} />}>
            Đặt lại toàn bộ tiến độ
          </Button>
        </Section>
      </div>
    </div>
  );
}
