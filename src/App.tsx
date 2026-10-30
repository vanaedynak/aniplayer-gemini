import React, { useEffect } from 'react';
import { usePlayerStore } from './store/usePlayerStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { TitleDetailView } from './components/TitleDetailView';
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
    // Keyboard shortcut Ctrl+K / Cmd+K for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Apply theme
    document.documentElement.classList.remove('theme-animix', 'theme-cyber', 'theme-oled');
    document.documentElement.classList.add(`theme-${settings.theme || 'animix'}`);

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
  }, [settings.theme]);

  // Handle native zoom scaling without viewport shifting or gutters
  useEffect(() => {
    const scale = settings.uiScale || 1.0;
    if (window.electronAPI?.setZoomFactor) {
      window.electronAPI.setZoomFactor(scale);
    } else {
      (document.documentElement as HTMLElement).style.zoom = String(scale);
    }
  }, [settings.uiScale]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0B0E14] flex flex-col text-white pt-safe pb-safe pl-safe pr-safe font-sans select-none">
      {/* Top Header */}
      <Header />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-hidden flex flex-col bg-[#0B0E14]">
          {currentView === 'home' && <HomeView />}
          {currentView === 'title_detail' && <TitleDetailView />}
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
