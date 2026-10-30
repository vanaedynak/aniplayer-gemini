import React, { useEffect } from 'react';
import { usePlayerStore } from './store/usePlayerStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { PlayerView } from './components/PlayerView';
import { ProfileView } from './components/ProfileView';
import { CategoriesView } from './components/CategoriesView';
import { CollectionView } from './components/CollectionView';
import { LeaderboardView } from './components/LeaderboardView';
import { MangaView } from './components/MangaView';
import { SearchModal } from './components/SearchModal';

export const App: React.FC = () => {
  const { currentView, settings, setSearchOpen, setUpdateAvailable } = usePlayerStore();

  useEffect(() => {
    // Apply initial UI scale
    if (settings.uiScale) {
      document.documentElement.style.setProperty('--ui-scale', String(settings.uiScale));
    }

    // Keyboard shortcut Ctrl+K / Cmd+K for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Check for updates in Electron
    if (window.electronAPI) {
      window.electronAPI.checkForUpdates().then((res: any) => {
        if (res && res.hasUpdate && res.release) {
          setUpdateAvailable(res.release);
        }
      });

      const unsubscribe = window.electronAPI.onUpdateAvailable((release) => {
        setUpdateAvailable(release);
      });
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        unsubscribe();
      };
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.uiScale]);

  return (
    <div
      style={{ zoom: settings.uiScale || 1.0 }}
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0E14] text-white pt-safe pb-safe pl-safe pr-safe font-sans"
    >
      {/* Top Header Bar */}
      <Header />

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-hidden flex flex-col bg-[#0B0E14]">
          {currentView === 'home' && <HomeView />}
          {currentView === 'player' && <PlayerView />}
          {currentView === 'profile' && <ProfileView />}
          {currentView === 'categories' && <CategoriesView />}
          {currentView === 'collection' && <CollectionView />}
          {currentView === 'leaderboard' && <LeaderboardView />}
          {currentView === 'manga' && <MangaView />}
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal />
    </div>
  );
};
