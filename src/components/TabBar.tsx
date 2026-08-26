import type { TabId } from '../config/types';

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'hoc', label: 'Học' },
  { id: 'kiemtra', label: 'Kiểm tra' },
  { id: 'toanbo', label: 'Toàn bộ' },
  { id: 'caidat', label: 'Cài đặt' },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      borderTop: '1px solid var(--border-default)',
      background: 'var(--surface-card)',
      flexShrink: 0,
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
    }}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-label={tab.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '10px 4px 8px',
              fontSize: 'var(--text-xs)',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-primary)' : 'var(--ink-tertiary)',
              background: 'transparent',
              position: 'relative',
              minHeight: '52px',
              transition: 'color 0.15s ease',
            }}
          >
            <div style={{
              width: '20px',
              height: '3px',
              borderRadius: 'var(--radius-pill)',
              background: isActive ? 'var(--color-primary)' : 'transparent',
              marginBottom: '2px',
              transition: 'background 0.15s ease',
            }} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
