import { Song } from '../types';

interface Props {
  songs: Song[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export function PlaylistPanel({ songs, currentId, onSelect, onDelete }: Props) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Playlist</span>
        <span style={styles.count}>{songs.length} songs</span>
      </div>

      {songs.length === 0 ? (
        <div style={styles.empty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--text-secondary)" style={{ marginBottom: 12 }}>
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
          <p>No songs yet</p>
        </div>
      ) : (
        <div style={styles.list}>
          {songs.map((song, i) => {
            const active = song.id === currentId;
            return (
              <div
                key={song.id}
                style={{ ...styles.row, background: active ? 'rgba(245,73,39,0.1)' : 'transparent' }}
                onClick={() => onSelect(song.id)}
              >
                {/* Cover thumbnail */}
                <div style={styles.thumb}>
                  {song.coverUrl
                    ? <img src={song.coverUrl} alt="cover" style={styles.thumbImg} />
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-secondary)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
                  }
                  {active && (
                    <div style={styles.playingOverlay}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent)"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  )}
                </div>

                <span style={styles.index}>{active ? '' : i + 1}</span>

                <div style={styles.songInfo}>
                  <span style={{ ...styles.songTitle, color: active ? 'var(--accent)' : 'var(--text)' }}>
                    {song.title}
                  </span>
                  <span style={styles.songArtist}>{song.artist}</span>
                </div>

                {song.audioUrl && (
                  <span title="Has audio" style={{ flexShrink: 0, display: 'flex' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--text-secondary)">
                      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                    </svg>
                  </span>
                )}

                <span style={styles.dur}>{formatTime(song.duration)}</span>

                <button
                  style={styles.deleteBtn}
                  onClick={e => { e.stopPropagation(); onDelete(song.id); }}
                  title="Remove"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  count: { fontSize: 12, color: 'var(--text-secondary)' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 },
  list: { flex: 1, overflowY: 'auto', padding: '0 8px 8px' },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 8,
    cursor: 'pointer', transition: 'background 0.15s',
  },
  thumb: {
    width: 36, height: 36, borderRadius: 6, flexShrink: 0,
    background: 'rgba(0,0,0,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  playingOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  index: { width: 16, textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 },
  songInfo: { flex: 1, minWidth: 0 },
  songTitle: { display: 'block', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  songArtist: { display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 },
  dur: { fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 },
  deleteBtn: { color: 'var(--text-secondary)', padding: 4, borderRadius: 4, display: 'flex', background: 'none', border: 'none', cursor: 'pointer' },
};
