import { useEffect, useRef, useState } from 'react';
import { Song, PlayerStatus } from '../types';

interface Props {
  song: Song | null;
  status: PlayerStatus;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEnded: () => void;
}

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function PlayerBar({ song, status, onPlay, onPause, onNext, onPrev, onEnded }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const prevSongId = useRef<string | null>(null);

  const isPlaying = status === 'PLAYING';
  const isPaused = status === 'PAUSED';
  const isStopped = status === 'STOPPED';

  // When song changes: load new src and auto-play if status is PLAYING
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (song?.id !== prevSongId.current) {
      prevSongId.current = song?.id ?? null;
      audio.pause();
      setProgress(0);
      setCurrentTime(0);
      setAudioDuration(0);

      if (song?.audioUrl) {
        audio.src = song.audioUrl;
        audio.load();
        if (isPlaying) {
          audio.play().catch(() => {});
        }
      } else {
        audio.src = '';
      }
    }
  }, [song?.id, isPlaying]);

  // Sync play/pause state with backend status changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Only play if we have a src loaded
      if (audio.src && audio.src !== window.location.href) {
        audio.play().catch(() => {});
      }
    } else {
      // PAUSED or STOPPED — always pause the audio element
      audio.pause();
      if (isStopped) {
        audio.currentTime = 0;
        setProgress(0);
        setCurrentTime(0);
      }
    }
  }, [isPlaying, isPaused, isStopped]);

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration || isNaN(audio.duration)) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioDuration(audio.duration);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration || isNaN(audio.duration)) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = (val / 100) * audio.duration;
    setProgress(val);
    setCurrentTime(audio.currentTime);
  }

  const displayDuration = audioDuration > 0 ? audioDuration : (song?.duration ?? 0);
  const hasAudio = !!song?.audioUrl;

  return (
    <div style={styles.bar}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
      />

      {/* Left: cover + song info */}
      <div style={styles.info}>
        <div style={styles.artwork}>
          {song?.coverUrl
            ? <img src={song.coverUrl} alt="cover" style={styles.coverImg} />
            : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(0,0,0,0.3)">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
              </svg>
            )
          }
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={styles.songTitle}>{song?.title ?? '—'}</div>
          <div style={styles.songArtist}>{song?.artist ?? 'No song selected'}</div>
        </div>
      </div>

      {/* Center: controls + progress */}
      <div style={styles.center}>
        <div style={styles.controls}>
          {/* Previous */}
          <button style={styles.ctrlBtn} onClick={onPrev} title="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            style={{
              ...styles.playBtn,
              opacity: !song ? 0.4 : 1,
              cursor: !song ? 'not-allowed' : 'pointer',
            }}
            onClick={isPlaying ? onPause : onPlay}
            disabled={!song}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Next */}
          <button style={styles.ctrlBtn} onClick={onNext} title="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressRow}>
          <span style={styles.time}>{formatTime(currentTime)}</span>
          <div style={styles.sliderWrap}>
            <div
              style={{
                ...styles.sliderFill,
                width: `${progress}%`,
              }}
            />
            <input
              type="range" min={0} max={100} step={0.1}
              value={progress}
              onChange={handleSeek}
              disabled={!hasAudio}
              style={{
                ...styles.slider,
                opacity: hasAudio ? 1 : 0.4,
                cursor: hasAudio ? 'pointer' : 'default',
              }}
            />
          </div>
          <span style={styles.time}>{formatTime(displayDuration)}</span>
        </div>
      </div>

      {/* Right: status */}
      <div style={styles.right}>
        <span style={{
          ...styles.badge,
          background: isPlaying
            ? 'rgba(245,73,39,0.15)'
            : isPaused
              ? 'rgba(0,0,0,0.1)'
              : 'rgba(0,0,0,0.06)',
          color: isPlaying ? 'var(--accent)' : 'var(--text-secondary)',
        }}>
          {status}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: 88,
    background: 'rgba(120,108,108,0.95)',
    backdropFilter: 'blur(28px)',
    borderTop: '1px solid rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center',
    padding: '0 28px', gap: 20, zIndex: 100,
  },
  info: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  artwork: {
    width: 50, height: 50, borderRadius: 8, flexShrink: 0,
    background: 'rgba(0,0,0,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover' },
  songTitle: {
    fontSize: 13, fontWeight: 700,
    color: 'var(--text)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  songArtist: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 2, minWidth: 0 },
  controls: { display: 'flex', alignItems: 'center', gap: 8 },
  ctrlBtn: {
    color: 'var(--text)',
    padding: 7, borderRadius: 8,
    display: 'flex', background: 'none', border: 'none', cursor: 'pointer',
    transition: 'opacity 0.15s',
    opacity: 0.7,
  },
  playBtn: {
    width: 42, height: 42, borderRadius: '50%',
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', transition: 'background 0.15s, transform 0.1s',
    boxShadow: '0 2px 12px rgba(245,73,39,0.4)',
  },
  progressRow: { display: 'flex', alignItems: 'center', gap: 8, width: '100%' },
  time: { fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0, minWidth: 30, textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
  sliderWrap: { flex: 1, position: 'relative', height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.2)' },
  sliderFill: { position: 'absolute', left: 0, top: 0, height: '100%', background: 'var(--accent)', borderRadius: 2, pointerEvents: 'none' },
  slider: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    opacity: 0, margin: 0,
    accentColor: 'var(--accent)',
  },
  right: { flex: 1, display: 'flex', justifyContent: 'flex-end' },
  badge: {
    fontSize: 10, fontWeight: 700,
    padding: '3px 10px', borderRadius: 20,
    letterSpacing: '0.06em', textTransform: 'uppercase',
  },
};
