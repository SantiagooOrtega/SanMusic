import { Song } from '../types';

interface Props { history: Song[]; }

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export function HistoryPanel({ history }: Props) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Recently Played</span>
        <span style={styles.count}>{history.length}</span>
      </div>
      {history.length === 0 ? (
        <div style={styles.empty}>Nothing played yet</div>
      ) : (
        <div style={styles.list}>
          {[...history].reverse().map((song, i) => (
            <div key={`${song.id}-${i}`} style={styles.row}>
              <div style={styles.artwork}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-secondary)">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                </svg>
              </div>
              <div style={styles.info}>
                <span style={styles.songTitle}>{song.title}</span>
                <span style={styles.songArtist}>{song.artist}</span>
              </div>
              <span style={styles.dur}>{formatTime(song.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  count: { fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: 20 },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 },
  list: { flex: 1, overflowY: 'auto', padding: '0 8px 8px' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8 },
  artwork: { width: 32, height: 32, borderRadius: 6, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  songTitle: { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  songArtist: { display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 },
  dur: { fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 },
};
