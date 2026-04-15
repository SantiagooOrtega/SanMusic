import { useState } from 'react';
import { Song } from '../types';
import { Modal } from './Modal';
import { SongFormModal } from './SongFormModal';

interface Props {
  songs: Song[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (data: { title: string; artist: string; duration: number; audio?: File; cover?: File }) => Promise<void>;
  onEdit: (id: string, data: { title: string; artist: string; duration: number; audio?: File; cover?: File }) => Promise<void>;
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export function PlaylistPage({ songs, currentId, onSelect, onDelete, onAdd, onEdit }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const songToDelete = songs.find(s => s.id === confirmId);

  return (
    <div style={styles.page}>
      {/* Page header */}
      <div style={styles.header}>
        <div>
          <div style={styles.pageTitle}>Playlist</div>
          <div style={styles.pageSubtitle}>{songs.length} songs</div>
        </div>
        <button style={styles.addBtn} onClick={() => setAddOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Add Song
        </button>
      </div>

      {/* Table */}
      {songs.length === 0 ? (
        <div style={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--text-secondary)" style={{ marginBottom: 14 }}>
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
          <p style={{ marginBottom: 16 }}>No songs yet</p>
          <button style={styles.addBtn} onClick={() => setAddOpen(true)}>+ Add your first song</button>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          {/* Column headers */}
          <div style={styles.colHeader}>
            <span style={{ width: 32 }}>#</span>
            <span style={{ width: 44 }}></span>
            <span style={{ flex: 1 }}>Title</span>
            <span style={{ width: 140 }}>Artist</span>
            <span style={{ width: 60, textAlign: 'right' }}>Duration</span>
            <span style={{ width: 72 }}></span>
          </div>

          {songs.map((song, i) => {
            const active = song.id === currentId;
            return (
              <div
                key={song.id}
                style={{ ...styles.row, background: active ? 'rgba(245,73,39,0.08)' : 'transparent' }}
                onClick={() => onSelect(song.id)}
              >
                {/* Index / playing indicator */}
                <span style={styles.idx}>
                  {active
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)"><path d="M8 5v14l11-7z"/></svg>
                    : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{i + 1}</span>
                  }
                </span>

                {/* Cover */}
                <div style={styles.thumb}>
                  {song.coverUrl
                    ? <img src={song.coverUrl} alt="" style={styles.thumbImg} />
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-secondary)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
                  }
                </div>

                {/* Title + audio badge */}
                <div style={styles.titleCell}>
                  <span style={{ ...styles.songTitle, color: active ? 'var(--accent)' : 'var(--text)' }}>
                    {song.title}
                  </span>
                  {song.audioUrl && <span style={styles.audioBadge}>MP3</span>}
                </div>

                <span style={styles.artist}>{song.artist}</span>
                <span style={styles.dur}>{formatTime(song.duration)}</span>

                {/* Actions */}
                <div style={styles.actions} onClick={e => e.stopPropagation()}>
                  <button
                    style={styles.iconBtn}
                    title="Edit"
                    onClick={() => setEditSong(song)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button
                    style={{ ...styles.iconBtn, color: 'var(--accent)' }}
                    title="Delete"
                    onClick={() => setConfirmId(song.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      <Modal open={addOpen} title="Add Song" onClose={() => setAddOpen(false)}>
        <SongFormModal
          onSubmit={onAdd}
          onClose={() => setAddOpen(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editSong} title="Edit Song" onClose={() => setEditSong(null)}>
        {editSong && (
          <SongFormModal
            song={editSong}
            onSubmit={data => onEdit(editSong.id, data)}
            onClose={() => setEditSong(null)}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!confirmId} title="Remove Song" onClose={() => setConfirmId(null)}>
        <div style={styles.confirm}>
          <p style={styles.confirmText}>
            Remove <strong style={{ color: 'var(--text)' }}>{songToDelete?.title}</strong> from the playlist?
          </p>
          <div style={styles.confirmActions}>
            <button style={styles.cancelBtn} onClick={() => setConfirmId(null)}>Cancel</button>
            <button
              style={styles.deleteConfirmBtn}
              onClick={() => { onDelete(confirmId!); setConfirmId(null); }}
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 28px' },
  header: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' },
  pageSubtitle: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 10, padding: '9px 16px',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 },
  tableWrap: { flex: 1, overflowY: 'auto' },
  colHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '0 12px 10px',
    fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    marginBottom: 4,
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 12px', borderRadius: 8,
    cursor: 'pointer', transition: 'background 0.15s',
  },
  idx: { width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  thumb: {
    width: 44, height: 44, borderRadius: 8, flexShrink: 0,
    background: 'rgba(0,0,0,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  titleCell: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 },
  songTitle: { fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  audioBadge: {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
    background: 'rgba(245,73,39,0.15)', color: 'var(--accent)',
    padding: '2px 6px', borderRadius: 4, flexShrink: 0,
  },
  artist: { width: 140, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 },
  dur: { width: 60, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 },
  actions: { width: 72, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, flexShrink: 0 },
  iconBtn: {
    color: 'var(--text-secondary)', background: 'none', border: 'none',
    padding: 6, borderRadius: 6, cursor: 'pointer', display: 'flex',
    transition: 'background 0.15s',
  },
  confirm: { display: 'flex', flexDirection: 'column', gap: 20 },
  confirmText: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 },
  confirmActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  deleteConfirmBtn: {
    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
  },
};
