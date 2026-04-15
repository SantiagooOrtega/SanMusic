import { useEffect, useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Song, PlayerStatus } from './types';
import { api } from './services/api';
import { storage } from './services/storage';
import { PlayerBar } from './components/PlayerBar';
import { PlaylistPanel } from './components/PlaylistPanel';
import { PlaylistPage } from './components/PlaylistPage';
import { HistoryPanel } from './components/HistoryPanel';

type Tab = 'playlist' | 'manage' | 'history';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [status, setStatus] = useState<PlayerStatus>('STOPPED');
  const [tab, setTab] = useState<Tab>('playlist');
  const initialized = useRef(false);

  // ── Persist songs to localStorage whenever they change ──────────────────
  useEffect(() => {
    if (initialized.current) {
      storage.saveSongs(songs);
    }
  }, [songs]);

  useEffect(() => {
    storage.saveCurrentId(currentSong?.id ?? null);
  }, [currentSong?.id]);

  // ── On mount: restore from localStorage, then sync with backend ─────────
  const refresh = useCallback(async () => {
    try {
      const [playlist, state, hist] = await Promise.all([
        api.getPlaylist(),
        api.getStatus(),
        api.getHistory(),
      ]);

      // Merge backend songs with any locally stored audioUrl/coverUrl
      // (backend songs from seed won't have local file URLs)
      const saved = storage.loadSongs();
      const savedMap = new Map(saved.map(s => [s.id, s]));

      const merged = playlist.map(s => {
        const local = savedMap.get(s.id);
        return {
          ...s,
          // Prefer backend URL (uploaded file), fall back to locally stored URL
          audioUrl: s.audioUrl ?? local?.audioUrl,
          coverUrl: s.coverUrl ?? local?.coverUrl,
        };
      });

      setSongs(merged);
      setCurrentSong(state.song);
      setStatus(state.status);
      setHistory(hist);
      initialized.current = true;
    } catch {
      // Backend unreachable — load from localStorage only
      const saved = storage.loadSongs();
      setSongs(saved);
      const savedId = storage.loadCurrentId();
      if (savedId) {
        const found = saved.find(s => s.id === savedId) ?? null;
        setCurrentSong(found);
      }
      initialized.current = true;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Player controls ──────────────────────────────────────────────────────
  async function handlePlay() {
    try {
      const s = await api.play();
      setStatus(s.status); setCurrentSong(s.song);
      setHistory(await api.getHistory());
    } catch {
      // Offline: just flip status locally
      setStatus('PLAYING');
    }
  }

  async function handlePause() {
    try {
      const s = await api.pause();
      setStatus(s.status); setCurrentSong(s.song);
    } catch {
      setStatus('PAUSED');
    }
  }

  async function handleNext() {
    try {
      const s = await api.next();
      setStatus(s.status);
      // Merge local audioUrl back in case backend doesn't have it
      const local = songs.find(s2 => s2.id === s.song?.id);
      setCurrentSong(s.song ? { ...s.song, audioUrl: s.song.audioUrl ?? local?.audioUrl, coverUrl: s.song.coverUrl ?? local?.coverUrl } : null);
      setHistory(await api.getHistory());
    } catch {
      const idx = songs.findIndex(s => s.id === currentSong?.id);
      if (idx >= 0 && idx < songs.length - 1) setCurrentSong(songs[idx + 1]);
    }
  }

  async function handlePrev() {
    try {
      const s = await api.previous();
      const local = songs.find(s2 => s2.id === s.song?.id);
      setStatus(s.status);
      setCurrentSong(s.song ? { ...s.song, audioUrl: s.song.audioUrl ?? local?.audioUrl, coverUrl: s.song.coverUrl ?? local?.coverUrl } : null);
      setHistory(await api.getHistory());
    } catch {
      const idx = songs.findIndex(s => s.id === currentSong?.id);
      if (idx > 0) setCurrentSong(songs[idx - 1]);
    }
  }

  async function handleEnded() {
    await handleNext();
  }

  async function handleSelect(id: string) {
    try {
      await api.setCurrent(id);
      const s = await api.play();
      const local = songs.find(s2 => s2.id === s.song?.id);
      setStatus(s.status);
      setCurrentSong(s.song ? { ...s.song, audioUrl: s.song.audioUrl ?? local?.audioUrl, coverUrl: s.song.coverUrl ?? local?.coverUrl } : null);
      setHistory(await api.getHistory());
    } catch {
      const found = songs.find(s => s.id === id) ?? null;
      setCurrentSong(found);
      setStatus('PLAYING');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteSong(id);
    } catch { /* offline */ }
    const updated = songs.filter(s => s.id !== id);
    setSongs(updated);
    if (currentSong?.id === id) { setCurrentSong(null); setStatus('STOPPED'); }
  }

  async function handleAdd(data: { title: string; artist: string; duration: number; audio?: File; cover?: File }): Promise<void> {
    try {
      await api.addSong(data);
      await refresh();
      setTab('playlist');
    } catch {
      // Offline fallback — create local-only song
      const song: Song = {
        id: uuidv4(),
        title: data.title,
        artist: data.artist,
        duration: data.duration,
        audioUrl: data.audio ? URL.createObjectURL(data.audio) : undefined,
        coverUrl: data.cover ? URL.createObjectURL(data.cover) : undefined,
      };
      setSongs(prev => [...prev, song]);
      setTab('playlist');
    }
  }

  async function handleEdit(id: string, data: { title: string; artist: string; duration: number; audio?: File; cover?: File }) {
    try {
      await api.updateSong(id, data);
      await refresh();
    } catch {
      // Offline: update locally
      setSongs(prev => prev.map(s => s.id !== id ? s : {
        ...s,
        title: data.title,
        artist: data.artist,
        duration: data.duration,
        audioUrl: data.audio ? URL.createObjectURL(data.audio) : s.audioUrl,
        coverUrl: data.cover ? URL.createObjectURL(data.cover) : s.coverUrl,
      }));
    }
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'playlist',
      label: 'Now Playing',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>,
    },
    {
      id: 'manage',
      label: 'Playlist',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>,
    },
    {
      id: 'history',
      label: 'History',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7v4l5-5-5-5v4z"/></svg>,
    },
  ];

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--accent)">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
          <span style={styles.logoText}>Music-San</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{ ...styles.navItem, ...(tab === item.id ? styles.navActive : {}) }}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={styles.main}>
        {tab === 'playlist' && (
          <PlaylistPanel
            songs={songs}
            currentId={currentSong?.id ?? null}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        )}
        {tab === 'manage' && (
          <PlaylistPage
            songs={songs}
            currentId={currentSong?.id ?? null}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onEdit={handleEdit}
          />
        )}
        {tab === 'history' && <HistoryPanel history={history} />}
      </main>

      <PlayerBar
        song={currentSong}
        status={status}
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNext}
        onPrev={handlePrev}
        onEnded={handleEnded}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: {
    width: 220, flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column',
    paddingBottom: 88,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, padding: '22px 20px 18px' },
  logoText: { fontSize: 19, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
    transition: 'background 0.15s, color 0.15s',
    textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
  },
  navActive: { background: 'rgba(245,73,39,0.15)', color: 'var(--accent)' },
  main: { flex: 1, overflowY: 'auto', paddingBottom: 88, background: 'var(--bg)' },
};
