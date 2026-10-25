import { Injectable, inject } from '@angular/core';

import { SongRequest } from '../data/classical-drive';
import { HINDI } from '../data/stations';
import { Song } from '../models/song.model';
import { normalize } from '../utils/text.utils';
import { ArchiveService } from './archive.service';

/** A match has to cover at least this share of the song's name. */
const MIN_SCORE = 0.7;
/** How many albums to open per lookup before giving up. */
const ALBUMS_TO_TRY = 3;

/**
 * Finds a specific song ("Dil Ka Aalam" from "Aashiqui") on the Internet Archive.
 * It first opens the film's album and picks the closest track name; if there's
 * no film, or no match, it searches by the song's name instead.
 * Searches and albums are remembered, so songs from the same film share requests.
 */
@Injectable({ providedIn: 'root' })
export class SongFinderService {
  private readonly archive = inject(ArchiveService);
  private readonly searches = new Map<string, Promise<string[]>>();
  private readonly albums = new Map<string, Promise<Song[]>>();

  async find(request: SongRequest): Promise<Song | null> {
    if (request.film) {
      const found = await this.findIn(`"${request.film}" AND (${HINDI} OR soundtrack OR ost OR movie)`, request);
      if (found) return found;
    }

    const words = request.title.replace(/\([^)]*\)/g, ' ').split(/\s+/)
      .map(w => w.replace(/["():\\]/g, '')).filter(w => w.length > 1).join(' AND ');
    return words ? this.findIn(`(${words})`, request) : null;
  }

  /** Opens the top albums for `query` and returns the best-matching song, named as requested. */
  private async findIn(query: string, request: SongRequest): Promise<Song | null> {
    const ids = await this.searchIds(query);
    for (const id of ids.slice(0, ALBUMS_TO_TRY)) {
      const match = bestMatch(await this.songsOf(id), request.title);
      if (match) {
        // Show the clean, hand-written name instead of the uploader's file name.
        return { ...match, title: request.title, artist: request.artist || match.artist };
      }
    }
    return null;
  }

  private searchIds(query: string): Promise<string[]> {
    if (!this.searches.has(query)) {
      this.searches.set(query, this.archive.search(query, 6).then(docs => (docs ?? []).map(d => d.identifier)));
    }
    return this.searches.get(query)!;
  }

  private songsOf(itemId: string): Promise<Song[]> {
    if (!this.albums.has(itemId)) this.albums.set(itemId, this.archive.getSongs(itemId));
    return this.albums.get(itemId)!;
  }
}

/** The song whose name best matches `title`, or null if none is close enough. */
function bestMatch(songs: Song[], title: string): Song | null {
  const target = words(title);
  let best: Song | null = null;
  let bestScore = 0;
  for (const song of songs) {
    const score = similarity(target, words(song.title));
    if (score > bestScore) { best = song; bestScore = score; }
  }
  return bestScore >= MIN_SCORE ? best : null;
}

/**
 * How well two names match, 0 to 1. Counts shared words both ways, so
 * "Tujhe Dekha To" (a short file name) still matches "Tujhe Dekha To Ye Jaana Sanam".
 */
function similarity(target: string[], candidate: string[]): number {
  if (!target.length || !candidate.length) return 0;
  const shared = target.filter(w => candidate.includes(w)).length;
  const forward = shared / target.length;
  // A short file name only counts if it's at least 2 words and a fair part of the full name.
  const backward = candidate.length >= 2 && candidate.length >= target.length * 0.4
    ? candidate.filter(w => target.includes(w)).length / candidate.length
    : 0;
  return Math.max(forward, backward);
}

/**
 * Splits a Hindi song name into comparable words, smoothing common spelling
 * differences: "Pyaara" = "Pyara", "Chaahe" = "Chahe", "Deewana" = "Diwana".
 */
function words(text: string): string[] {
  return normalize(text.replace(/\([^)]*\)/g, ' '))
    .split(' ')
    .filter(Boolean)
    .map(w => w
      .replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/w/g, 'v').replace(/z/g, 'j')
      .replace(/([a-z])\1+/g, '$1')        // aa -> a, nn -> n
      .replace(/([kgcjtdpb])h/g, '$1')     // th -> t, kh -> k
      .replace(/y$/, 'i'));
}
