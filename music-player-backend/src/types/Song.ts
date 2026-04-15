export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
  coverUrl?: string; // optional cover image path
  audioUrl?: string; // optional audio file path
}
