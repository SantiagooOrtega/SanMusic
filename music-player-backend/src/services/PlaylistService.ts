import { Song } from '../types/Song';
import { sharedPlaylist } from './sharedPlaylist';

export class PlaylistService {
  nextSong(): Song | null { return sharedPlaylist.next()?.song ?? null; }

  previousSong(): Song | null { return sharedPlaylist.prev()?.song ?? null; }

  getCurrentSong(): Song | null { return sharedPlaylist.getCurrent()?.song ?? null; }

  setCurrentSong(id: string): boolean { return sharedPlaylist.setCurrent(id); }

  getPlaylist(): Song[] { return sharedPlaylist.getAll(); }

  getSize(): number { return sharedPlaylist.getSize(); }
}
