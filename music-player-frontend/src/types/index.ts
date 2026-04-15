export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl?: string;
  audioUrl?: string;
}

export type PlayerStatus = 'PLAYING' | 'PAUSED' | 'STOPPED';

export interface PlayerState {
  status: PlayerStatus;
  song: Song | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
