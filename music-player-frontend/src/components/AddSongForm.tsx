import { useState, useRef } from 'react';

interface Props {
  onAdd: (title: string, artist: string, duration: number, audio?: File, cover?: File) => Promise<void>;
}

export function AddSongForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  function handleAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAudioFile(file);
    // Auto-fill duration from audio metadata
    if (file) {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(String(Math.round(audio.duration)));
        URL.revokeObjectURL(url);
      });
      // Auto-fill title from filename
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }

  function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    } else {
      setCoverPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dur = parseInt(duration);
    if (!title.trim() || !artist.trim() || isNaN(dur) || dur <= 0) {
      setError('Title, artist and duration are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onAdd(title.trim(), artist.trim(), dur, audioFile ?? undefined, coverFile ?? undefined);
      setTitle(''); setArtist(''); setDuration('');
      setAudioFile(null); setCoverFile(null); setCoverPreview(null);
      if (audioRef.current) audioRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.sectionTitle}>Add Song</div>

      {/* Cover preview + picker */}
      <div style={styles.coverRow}>
        <div style={styles.coverThumb} onClick={() => coverRef.current?.click()}>
          {coverPreview
            ? <img src={coverPreview} alt="cover" style={styles.coverImg} />
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-secondary)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          }
        </div>
        <div style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)' }}>
          {coverFile ? coverFile.name : 'Click to add cover'}
        </div>
        <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
      </div>

      <input style={styles.input} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input style={styles.input} placeholder="Artist" value={artist} onChange={e => setArtist(e.target.value)} />
      <input style={styles.input} placeholder="Duration (sec)" type="number" min={1} value={duration} onChange={e => setDuration(e.target.value)} />

      {/* Audio file picker */}
      <button type="button" style={styles.fileBtn} onClick={() => audioRef.current?.click()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
        {audioFile ? audioFile.name : 'Import MP3 / Audio file'}
      </button>
      <input ref={audioRef} type="file" accept=".mp3,.wav,.ogg,.flac,.aac,.m4a,audio/*" style={{ display: 'none' }} onChange={handleAudio} />

      {error && <div style={styles.error}>{error}</div>}

      <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Adding…' : '+ Add Song'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px' },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  coverRow: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  coverThumb: {
    width: 44, height: 44, borderRadius: 8, flexShrink: 0,
    background: 'var(--surface2)', border: '1px dashed var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', cursor: 'pointer',
  },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover' },
  input: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '9px 12px',
    color: 'var(--text)', fontSize: 13, outline: 'none',
  },
  fileBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '9px 12px',
    color: 'var(--text-secondary)', fontSize: 12,
    cursor: 'pointer', textAlign: 'left',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  error: { fontSize: 11, color: 'var(--accent)' },
  btn: {
    background: 'var(--accent)', color: '#fff',
    borderRadius: 8, padding: '10px 0',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    marginTop: 2,
  },
};
