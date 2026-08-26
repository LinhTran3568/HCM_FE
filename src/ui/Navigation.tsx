import type { TabId } from '../config/types';
import {
  BookOpen,
  ClipboardCheck,
  Library,
  Settings,
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
  { id: 'hoc', label: 'Học', icon: BookOpen },
  { id: 'kiemtra', label: 'Kiểm tra', icon: ClipboardCheck },
  { id: 'toanbo', label: 'Toàn bộ', icon: Library },
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
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo area */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          HCM202
        </div>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
          marginTop: '2px',
        }}>
          Tư tưởng Hồ Chí Minh
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: 'var(--space-3) var(--space-2)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
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
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-normal)',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--color-primary-soft)' : 'transparent',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/* ── Mobile Bottom Nav ── */
export function BottomNav({ active, onChange }: NavigationProps) {
  return (
    <nav style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-surface)',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
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
              gap: '3px',
              padding: '8px 4px 6px',
              color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
              background: 'transparent',
              transition: 'color var(--transition-fast)',
              minHeight: 'var(--nav-height)',
              position: 'relative',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '25%',
                right: '25%',
                height: '2.5px',
                borderRadius: '0 0 var(--radius-full) var(--radius-full)',
                background: 'var(--color-primary)',
              }} />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
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
      background: 'var(--bg-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 'var(--header-height)',
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', lineHeight: 'var(--leading-tight)' }}>
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
