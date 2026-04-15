export interface CreateSongDTO {
  title: string;
  artist: string;
  duration: number;
  position?: number;
  coverUrl?: string;
  audioUrl?: string;
}
