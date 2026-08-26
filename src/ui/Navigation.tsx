import type { TabId } from '../config/types';
import {
  BookOpen,
  ClipboardCheck,
  Library,
  Settings,
  Info,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

/* ════════════════════════════════════════════
   NAVIGATION — Sidebar (desktop) + Bottom (mobile)
   ════════════════════════════════════════════ */

interface NavItem {
  id: TabId;
  label: string;
  icon: typeof BookOpen;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'intro', label: 'Giới thiệu', icon: Info },
  { id: 'hoc', label: 'Học bài', icon: BookOpen },
  { id: 'kiemtra', label: 'Kiểm tra', icon: ClipboardCheck },
  { id: 'toanbo', label: 'Ngân hàng câu', icon: Library },
  { id: 'caidat', label: 'Cài đặt', icon: Settings },
];

interface NavigationProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

/* ── Desktop Sidebar ── */
export function Sidebar({ active, onChange }: NavigationProps) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100dvh',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Logo area */}
      <div style={{
        padding: 'var(--space-5) var(--space-5)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            HCM202
          </div>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            marginTop: '2px',
            fontWeight: 'var(--weight-medium)',
          }}>
            Tư tưởng Hồ Chí Minh
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{
        padding: 'var(--space-4) var(--space-3)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--color-primary-soft)' : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  boxShadow: '0 0 8px var(--color-primary)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info badge */}
      <div style={{
        padding: 'var(--space-4)',
        margin: 'var(--space-3)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-inset)',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
          Hệ thống Leitner SRS
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Tối ưu ghi nhớ lâu dài
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Bottom Nav ── */
export function BottomNav({ active, onChange }: NavigationProps) {
  return (
    <nav style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${NAV_ITEMS.length}, 1fr)`,
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '8px 2px 6px',
              color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
              background: 'transparent',
              transition: 'all var(--transition-fast)',
              minHeight: 'var(--nav-height)',
              position: 'relative',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                right: '20%',
                height: '3px',
                borderRadius: '0 0 var(--radius-full) var(--radius-full)',
                background: 'var(--color-primary)',
                boxShadow: '0 2px 8px var(--color-primary)',
              }} />
            )}
            <Icon size={19} strokeWidth={isActive ? 2.2 : 1.7} />
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-normal)',
              letterSpacing: '0.01em',
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── Mobile Header ── */
interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function MobileHeader({ title, subtitle, action }: MobileHeaderProps) {
  return (
    <header style={{
      padding: 'var(--space-3) var(--space-4)',
      borderBottom: '1px solid var(--border-light)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 'var(--header-height)',
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', lineHeight: 'var(--leading-tight)', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '1px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}

export { NAV_ITEMS };

