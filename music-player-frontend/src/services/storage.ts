import { Song } from '../types';

const SONGS_KEY = 'music-san:songs';
const CURRENT_KEY = 'music-san:currentId';

// Persisted song — audioUrl stored as local file path hint (not a blob URL)
export interface PersistedSong extends Song {
  localAudioPath?: string; // original filename hint shown to user on reload
}

export const storage = {
  saveSongs(songs: Song[]): void {
    try {
      // Strip blob: URLs before saving — they don't survive page reload
      const toSave: PersistedSong[] = songs.map(s => ({
        ...s,
        audioUrl: s.audioUrl?.startsWith('blob:') ? undefined : s.audioUrl,
        coverUrl: s.coverUrl?.startsWith('blob:') ? undefined : s.coverUrl,
      }));
      localStorage.setItem(SONGS_KEY, JSON.stringify(toSave));
    } catch {
      // localStorage quota exceeded — fail silently
    }
  },

  loadSongs(): PersistedSong[] {
    try {
      const raw = localStorage.getItem(SONGS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as PersistedSong[];
    } catch {
      return [];
    }
  },

  saveCurrentId(id: string | null): void {
    if (id) localStorage.setItem(CURRENT_KEY, id);
    else localStorage.removeItem(CURRENT_KEY);
  },

  loadCurrentId(): string | null {
    return localStorage.getItem(CURRENT_KEY);
  },

  clear(): void {
    localStorage.removeItem(SONGS_KEY);
    localStorage.removeItem(CURRENT_KEY);
  },
};
