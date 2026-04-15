import { Song } from '../types/Song';
import { DoublyNode } from '../types/DoublyNode';

export class DoublyLinkedList {
  private head: DoublyNode | null = null;
  private tail: DoublyNode | null = null;
  private current: DoublyNode | null = null;
  private size: number = 0;

  private createNode(song: Song): DoublyNode {
    return { song, prev: null, next: null };
  }

  // Add a song at the beginning of the list
  addFirst(song: Song): void {
    const node = this.createNode(song);
    if (!this.head) {
      this.head = this.tail = this.current = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
      if (!this.current) this.current = node;
    }
    this.size++;
  }

  // Add a song at the end of the list
  addLast(song: Song): void {
    const node = this.createNode(song);
    if (!this.tail) {
      this.head = this.tail = this.current = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
      if (!this.current) this.current = node;
    }
    this.size++;
  }

  // Insert a song at a specific position (0-indexed)
  insertAt(song: Song, position: number): void {
    if (position <= 0) { this.addFirst(song); return; }
    if (position >= this.size) { this.addLast(song); return; }

    const node = this.createNode(song);
    let leader = this.head!;
    for (let i = 0; i < position - 1; i++) leader = leader.next!;

    const follower = leader.next!;
    leader.next = node;
    node.prev = leader;
    node.next = follower;
    follower.prev = node;
    this.size++;
  }

  // Remove a song by its id, returns true if found and deleted
  deleteById(id: string): boolean {
    let current = this.head;
    while (current) {
      if (current.song.id === id) {
        if (current === this.head && current === this.tail) {
          this.head = this.tail = this.current = null;
        } else if (current === this.head) {
          this.head = current.next;
          if (this.head) this.head.prev = null;
        } else if (current === this.tail) {
          this.tail = current.prev;
          if (this.tail) this.tail.next = null;
        } else {
          current.prev!.next = current.next;
          current.next!.prev = current.prev;
        }

        // If the deleted node was the current, reset to head
        if (this.current?.song.id === id) {
          this.current = this.head;
        }

        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Move to the next song and return it
  next(): DoublyNode | null {
    if (this.current?.next) this.current = this.current.next;
    return this.current;
  }

  // Move to the previous song and return it
  prev(): DoublyNode | null {
    if (this.current?.prev) this.current = this.current.prev;
    return this.current;
  }

  // Get the currently selected node
  getCurrent(): DoublyNode | null {
    return this.current;
  }

  // Set current node by song id, returns false if not found
  setCurrent(id: string): boolean {
    let node = this.head;
    while (node) {
      if (node.song.id === id) { this.current = node; return true; }
      node = node.next;
    }
    return false;
  }

  // Return all songs as an array (head to tail)
  getAll(): Song[] {
    const result: Song[] = [];
    let node = this.head;
    while (node) { result.push(node.song); node = node.next; }
    return result;
  }

  // Find a song by id, returns null if not found
  findById(id: string): Song | null {
    let node = this.head;
    while (node) {
      if (node.song.id === id) return node.song;
      node = node.next;
    }
    return null;
  }

  // Check if a song with the same title and artist already exists
  hasDuplicate(title: string, artist: string): boolean {
    let node = this.head;
    while (node) {
      if (
        node.song.title.toLowerCase() === title.toLowerCase() &&
        node.song.artist.toLowerCase() === artist.toLowerCase()
      ) return true;
      node = node.next;
    }
    return false;
  }

  // Return the number of songs in the list
  getSize(): number { return this.size; }
}
