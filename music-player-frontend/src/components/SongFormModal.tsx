import { useState, useRef, useEffect } from 'react';
import { Song } from '../types';

interface Props {
  // If song is provided, we're editing; otherwise adding
  song?: Song;
  onSubmit: (data: { title: string; artist: string; duration: number; audio?: File; cover?: File }) => Promise<void>;
  onClose: () => void;
}

export function SongFormModal({ song, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(song?.title ?? '');
  const [artist, setArtist] = useState(song?.artist ?? '');
  const [duration, setDuration] = useState(song ? String(song.duration) : '');  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(song?.coverUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const isEdit = !!song;

  // Reset form when song prop changes
  useEffect(() => {
    setTitle(song?.title ?? '');
    setArtist(song?.artist ?? '');
    // Only reset duration if adding (not editing)
    if (!song) setDuration('');
    setCoverPreview(song?.coverUrl ?? null);
    setAudioFile(null);
    setCoverFile(null);
    setError('');
  }, [song?.id]);

  function handleAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAudioFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(String(Math.round(audio.duration)));
        URL.revokeObjectURL(url);
      });
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }

  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
    else setCoverPreview(song?.coverUrl ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // When editing, keep the original duration; when adding, parse from input
    const dur = isEdit ? (song?.duration ?? 0) : parseInt(duration);
    if (!title.trim() || !artist.trim() || isNaN(dur) || dur <= 0) {
      setError('Title and artist are required.' + (!isEdit ? ' Duration must be positive.' : ''));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        artist: artist.trim(),
        duration: isEdit ? (song?.duration ?? 0) : parseInt(duration),
        audio: audioFile ?? undefined,
        cover: coverFile ?? undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Cover picker */}
      <div style={styles.coverRow}>
        <div style={styles.coverThumb} onClick={() => coverRef.current?.click()}>
          {coverPreview
            ? <img src={coverPreview} alt="cover" style={styles.coverImg} />
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--text-secondary)">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
          }
          <div style={styles.coverOverlay}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
        </div>
        <div>
          <div style={styles.coverLabel}>Cover art</div>
          <div style={styles.coverHint}>{coverFile ? coverFile.name : 'Click to upload image'}</div>
        </div>
        <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
      </div>

      {/* Fields */}
      <div style={styles.field}>
        <label style={styles.label}>Title</label>
        <input style={styles.input} placeholder="Song title" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Artist</label>
        <input style={styles.input} placeholder="Artist name" value={artist} onChange={e => setArtist(e.target.value)} />
      </div>

      {/* Duration only shown when adding — not editable by user */}
      {!isEdit && (
        <div style={styles.field}>
          <label style={styles.label}>Duration (seconds)</label>
          <input style={styles.input} placeholder="e.g. 210" type="number" min={1} value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
      )}

      {/* Audio picker */}
      <div style={styles.field}>
        <label style={styles.label}>Audio file</label>
        <button type="button" style={styles.fileBtn} onClick={() => audioRef.current?.click()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {audioFile ? audioFile.name : (isEdit && song?.audioUrl ? 'Replace audio file…' : 'Import MP3 / Audio')}
          </span>
        </button>
        <input ref={audioRef} type="file" accept=".mp3,.wav,.ogg,.flac,.aac,.m4a,audio/*" style={{ display: 'none' }} onChange={handleAudio} />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Actions */}
      <div style={styles.actions}>
        <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add song'}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  coverRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 },
  coverThumb: {
    width: 72, height: 72, borderRadius: 10, flexShrink: 0,
    background: 'var(--surface2)', border: '1px dashed var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', cursor: 'pointer', position: 'relative',
  },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover' },
  coverOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  coverLabel: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  coverHint: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' },
  input: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px',
    color: 'var(--text)', fontSize: 14, outline: 'none',
  },
  fileBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px',
    color: 'var(--text-secondary)', fontSize: 13,
    cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
  },
  error: { fontSize: 12, color: 'var(--accent)', padding: '6px 10px', background: 'rgba(252,60,68,0.08)', borderRadius: 6 },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: {
    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  submitBtn: {
    padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
  },
};
