import { Station } from '../models/station.model';
import { CLASSICAL_DRIVE } from './classical-drive';

/*
 * ==========================================================================
 *  PLAYLISTS — everything in the menu is defined here.
 *
 *  Each playlist is a live search on the Internet Archive (archive.org):
 *  free, ad-free, no API key. Results are sorted by downloads, so the
 *  most-loved uploads play first.
 *
 *  query        archive.org search words (AND / OR and "quoted phrases")
 *  backupQuery  looser search, used only if `query` finds too few songs
 *  items        archive.org item IDs that always play first
 *               (the part after archive.org/details/ in a link)
 *  songList     a hand-picked list of songs, played in order
 *               (see classical-drive.ts)
 *
 *  Tip: try a search on https://archive.org/search (choose "Audio") first.
 * ==========================================================================
 */

/** Words that mark an upload as Hindi film music. */
export const HINDI = '(bollywood OR "hindi film" OR "hindi songs" OR "hindi movie" OR filmi OR hindi)';

/** Search pair for a singer: their Hindi songs first, anything by them as backup. */
function singer(name: string): Pick<Station, 'query' | 'backupQuery'> {
  return { query: `"${name}" AND ${HINDI}`, backupQuery: `"${name}"` };
}

export const STATIONS: Station[] = [
  // ---- Start here
  {
    key: 'drive', group: 'Start here', name: 'Classical Drive', subtitle: 'Bollywood long-drive classics',
    mark: '🚗', color: '#FF7A59', badge: 'Hand-picked',
    songList: CLASSICAL_DRIVE,
  },
  {
    key: 'top', group: 'Start here', name: 'Top Classics', subtitle: 'Most downloaded evergreens',
    mark: '★', color: '#FFB36B', badge: 'Most played',
    query: `${HINDI} AND (evergreen OR classics OR superhits OR "golden hits" OR "old songs")`,
    backupQuery: HINDI,
  },

  // ---- Eras
  {
    key: '80s', group: 'Eras', name: '80s Gold', subtitle: 'Kishore, Lata, Bappi da', mark: '80', color: '#9B59FF',
    query: `${HINDI} AND (80s OR "80's" OR 1980s OR 1980 OR 1985 OR 1989)`,
    backupQuery: `"kishore kumar" OR "bappi lahiri" OR "r d burman" OR "laxmikant pyarelal"`,
  },
  {
    key: '90s', group: 'Eras', name: '90s Bollywood', subtitle: 'Kumar Sanu, Udit, Alka', mark: '90', color: '#FF6F91',
    query: `${HINDI} AND (90s OR "90's" OR 1990s OR 1990 OR 1995 OR 1999)`,
    backupQuery: `"kumar sanu" OR "udit narayan" OR "alka yagnik" OR "nadeem shravan"`,
  },
  {
    key: '00s', group: 'Eras', name: '2000s Nostalgia', subtitle: 'Flip-phone romance', mark: '00', color: '#5EC8FF',
    query: `${HINDI} AND (2000s OR "2000's" OR 2000 OR 2004 OR 2008)`,
    backupQuery: `"sonu nigam" OR shaan OR "atif aslam" OR "himesh reshammiya"`,
  },

  // ---- Moods
  {
    key: 'rom', group: 'Moods', name: 'Romantic', subtitle: 'Pyaar, ishq, mohabbat', mark: '♡', color: '#FF4F8B',
    query: `${HINDI} AND (romantic OR "love songs" OR love)`,
    backupQuery: `romantic AND (hindi OR bollywood)`,
  },
  {
    key: 'sad', group: 'Moods', name: 'Sad Songs', subtitle: 'Dard bhare nagme', mark: '💔', color: '#5B6CFF',
    query: `${HINDI} AND (sad OR dard OR bewafa OR judai)`,
    backupQuery: `(sad OR dard) AND (hindi OR bollywood OR urdu)`,
  },
  {
    key: 'ghazal', group: 'Moods', name: 'Ghazals', subtitle: 'Jagjit, Ghulam Ali, Pankaj', mark: '♪', color: '#7B68EE',
    query: `(ghazal OR ghazals) AND ("jagjit singh" OR "ghulam ali" OR "pankaj udhas" OR "mehdi hassan" OR "chitra singh")`,
    backupQuery: `ghazal OR ghazals`,
  },
  {
    key: 'party', group: 'Moods', name: 'Dance & Party', subtitle: 'Disco deewane', mark: '✦', color: '#FF9F43',
    query: `${HINDI} AND (dance OR disco OR party OR remix)`,
    backupQuery: `"bappi lahiri" OR (disco AND hindi)`,
  },

  // ---- Singers
  { key: 'kishore', group: 'Singers', name: 'Kishore Kumar', subtitle: 'The voice of the 70s & 80s', mark: 'KK', color: '#E0A030', ...singer('kishore kumar') },
  { key: 'lata', group: 'Singers', name: 'Lata Mangeshkar', subtitle: 'Nightingale of India', mark: 'LM', color: '#D46A6A', ...singer('lata mangeshkar') },
  {
    key: 'rafi', group: 'Singers', name: 'Mohammed Rafi', subtitle: 'Golden-era legend', mark: 'MR', color: '#B5651D',
    query: `("mohammed rafi" OR "mohd rafi") AND ${HINDI}`,
    backupQuery: `"mohammed rafi" OR "mohd rafi"`,
  },
  { key: 'asha', group: 'Singers', name: 'Asha Bhosle', subtitle: 'Cabaret to ghazal', mark: 'AB', color: '#E07AA6', ...singer('asha bhosle') },
  { key: 'sanu', group: 'Singers', name: 'Kumar Sanu', subtitle: 'King of the 90s', mark: 'KS', color: '#C2185B', ...singer('kumar sanu') },
  { key: 'alka', group: 'Singers', name: 'Alka Yagnik', subtitle: 'Queen of 90s duets', mark: 'AY', color: '#F06292', ...singer('alka yagnik') },
  { key: 'udit', group: 'Singers', name: 'Udit Narayan', subtitle: 'Papa kehte hain…', mark: 'UN', color: '#8E24AA', ...singer('udit narayan') },
  { key: 'sonu', group: 'Singers', name: 'Sonu Nigam', subtitle: '2000s heartthrob', mark: 'SN', color: '#3F7FBF', ...singer('sonu nigam') },

  // ---- Composers
  {
    key: 'rdb', group: 'Composers', name: 'R.D. Burman', subtitle: 'Pancham da', mark: 'RD', color: '#2FC4A0',
    query: `("r d burman" OR "r.d. burman" OR "rd burman" OR "rahul dev burman")`,
    backupQuery: `burman AND ${HINDI}`,
  },
  {
    key: 'ns', group: 'Composers', name: 'Nadeem–Shravan', subtitle: 'Aashiqui, Saajan, Raja Hindustani', mark: 'NS', color: '#FF8A7A',
    query: `("nadeem shravan" OR "nadeem-shravan")`,
    backupQuery: `nadeem AND shravan`,
  },
  {
    key: 'jl', group: 'Composers', name: 'Jatin–Lalit', subtitle: 'Late-90s romance', mark: 'JL', color: '#F2709C',
    query: `("jatin lalit" OR "jatin-lalit")`,
    backupQuery: `jatin AND lalit`,
  },
  {
    key: 'arr', group: 'Composers', name: 'A.R. Rahman', subtitle: 'Roja to Rang De', mark: 'AR', color: '#4A90D9',
    query: `("a r rahman" OR "a.r. rahman" OR "ar rahman") AND ${HINDI}`,
    backupQuery: `"a r rahman" OR "a.r. rahman" OR "ar rahman"`,
  },
];

/** The visitor's own hearts. Always last in the menu. */
export const LIKED_STATION: Station = {
  key: 'liked', group: 'Yours', name: '♥ Liked', subtitle: 'Songs you saved', mark: '♥', color: '#FF6F91', isLiked: true,
};

/** How many songs one playlist holds. */
export const MAX_SONGS = 150;
/** If the main search finds fewer songs than this, the backup search runs too. */
export const MIN_SONGS_BEFORE_BACKUP = 30;
/** How long a playlist's song list is remembered in the visitor's browser. */
export const CACHE_DAYS = 3;
