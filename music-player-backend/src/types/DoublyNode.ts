import { Song } from './Song';

export interface DoublyNode {
  song: Song;
  prev: DoublyNode | null;
  next: DoublyNode | null;
}
