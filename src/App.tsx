import { useState, useEffect } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { Sidebar, BottomNav } from './ui/Navigation';
import { IntroPage } from './pages/IntroPage';
import { HocPage } from './pages/HocPage';
import { KiemTraPage } from './pages/KiemTraPage';
import { ToanBoPage } from './pages/ToanBoPage';
import { CaiDatPage } from './pages/CaiDatPage';
import type { TabId } from './config/types';

const INTRO_SEEN_KEY = 'hcm202_intro_seen';

/* ════════════════════════════════════════════
   APP SHELL — Responsive Layout
   Desktop: sidebar + centered content
   Mobile: header + bottom nav
   ════════════════════════════════════════════ */

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    try {
      return localStorage.getItem(INTRO_SEEN_KEY) ? 'hoc' : 'intro';
    } catch {
      return 'hoc';
    }
  });
  const isDesktop = useIsDesktop();

  const handleIntroEnter = (tab: TabId) => {
    try { localStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* */ }
    setActiveTab(tab);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'intro': return <IntroPage onEnter={handleIntroEnter} />;
      case 'hoc': return <HocPage />;
      case 'kiemtra': return <KiemTraPage />;
      case 'toanbo': return <ToanBoPage />;
      case 'caidat': return <CaiDatPage />;
    }
  };

  if (isDesktop) {
    return (
      <ThemeProvider>
        <div style={{ display: 'flex', minHeight: '100dvh' }}>
          <Sidebar active={activeTab} onChange={setActiveTab} />
          <main style={{
            flex: 1,
            marginLeft: 'var(--sidebar-width)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
          }}>
            <div style={{
              flex: 1,
              maxWidth: 'var(--content-max-width)',
              width: '100%',
              margin: '0 auto',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {renderPage()}
            </div>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        paddingBottom: 'var(--nav-height)',
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderPage()}
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </ThemeProvider>
  );
}
