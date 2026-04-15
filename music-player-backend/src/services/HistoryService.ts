import { Song } from '../types/Song';

export class HistoryService {
  private history: Song[] = [];
  private readonly maxHistory = 50;

  addToHistory(song: Song): void {
    if (this.history.length >= this.maxHistory) this.history.shift();
    this.history.push({ ...song });
  }

  getHistory(): Song[] { return [...this.history]; }

  clearHistory(): void { this.history = []; }
}
