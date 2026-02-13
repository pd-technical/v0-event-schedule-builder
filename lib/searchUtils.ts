/**
 * Search utilities: synonyms, related terms ("insects" → bugs, butterflies),
 * and fuzzy matching for spelling errors ("doxy" ↔ "doxie").
 */

/** Levenshtein edit distance between two strings */
function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  const dp: number[][] = Array(an + 1)
    .fill(null)
    .map(() => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) dp[i][0] = i;
  for (let j = 0; j <= bn; j++) dp[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[an][bn];
}

/** Max edit distance for fuzzy match: 1 for short words, 2 for longer */
function maxEditDistance(word: string): number {
  return word.length <= 4 ? 1 : 2;
}

/** Synonyms and related terms (query term → alternatives to also match) */
const SYNONYMS_AND_RELATED: Record<string, string[]> = {
  // Insects & related
  insect: ["bugs", "butterflies", "bee", "bees", "butterfly", "bug"],
  insects: ["bugs", "butterflies", "bee", "bees", "butterfly", "bug"],
  bug: ["insect", "insects", "butterflies", "bee", "butterfly"],
  bugs: ["insects", "butterflies", "bee", "bees", "butterfly"],
  butterfly: ["insect", "insects", "bugs", "bee"],
  butterflies: ["insects", "bugs", "bees"],
  bee: ["insect", "insects", "bugs", "butterfly", "butterflies"],
  bees: ["insects", "bugs", "butterflies"],
  // Dog / dachshund spelling variants and synonyms
  dog: ["canine", "puppy", "dogs", "dachshund", "doxie", "doxy"],
  dogs: ["canines", "dog", "dachshund", "doxie", "doxy"],
  doxy: ["doxie", "dachshund", "dog"],
  doxie: ["doxy", "dachshund", "dog"],
  dachshund: ["doxy", "doxie", "dog", "dogs"],
  canine: ["dog", "dogs"],
  // Racing
  racing: ["race", "races", "run", "running"],
  race: ["racing", "races", "run", "running"],
  races: ["racing", "race", "running"],
  run: ["racing", "race", "running"],
  running: ["racing", "race", "races", "run"],
  // Fair / event related
  fair: ["fairs", "exhibit", "exhibits", "festival"],
  exhibits: ["exhibit", "fair", "fairs", "display"],
  exhibit: ["exhibits", "fair", "display"],
  entertainment: ["show", "shows", "performance", "performances"],
  show: ["entertainment", "shows", "performance"],
  shows: ["entertainment", "show", "performances"],
  food: ["eating", "foods", "dining", "tasting"],
  animal: ["animals", "pet", "pets", "livestock"],
  animals: ["animal", "pets", "livestock"],
  children: ["kids", "family", "child"],
  kids: ["children", "family", "child"],
  discovery: ["discovery fair", "explore", "exploration"],
};

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/** Split text into normalized words (no empty) */
function toWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length > 0);
}

/** Expand query into all terms to match: query words + synonyms + related */
function getSearchTerms(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = toWords(q);
  const terms = new Set<string>();
  for (const w of words) {
    terms.add(w);
    const syns = SYNONYMS_AND_RELATED[w];
    if (syns) for (const s of syns) terms.add(s.toLowerCase());
  }
  return Array.from(terms);
}

/** True if `word` is within allowed edit distance of `queryWord` */
function fuzzyMatchWord(queryWord: string, word: string): boolean {
  if (queryWord.length < 2 || word.length < 2) return queryWord === word;
  const maxDist = maxEditDistance(queryWord);
  return levenshtein(queryWord, word) <= maxDist;
}

/** Check if any of the search terms (or fuzzy match) appears in text */
function textMatchesTerms(text: string, searchTerms: string[]): boolean {
  const lower = text.toLowerCase();
  const textWords = toWords(text);

  for (const term of searchTerms) {
    if (term.length < 2) continue;
    if (lower.includes(term)) return true;
    for (const textWord of textWords) {
      if (fuzzyMatchWord(term, textWord)) return true;
    }
  }
  return false;
}

export interface SearchableEvent {
  name: string;
  description: string;
  location: string;
}

/**
 * Returns true if the event matches the search query using:
 * - Exact substring match
 * - Synonyms and related terms (e.g. "dog racing" ↔ "canine", "race")
 * - Fuzzy spelling (e.g. "doxy" ↔ "doxie")
 */
export function eventMatchesSearch(
  event: SearchableEvent,
  searchQuery: string
): boolean {
  const q = searchQuery.trim();
  if (!q) return true;

  const searchTerms = getSearchTerms(q);
  const combined = [event.name, event.description, event.location].join(" ");

  if (searchTerms.length === 0) {
    return event.name.toLowerCase().includes(q.toLowerCase()) ||
      event.description.toLowerCase().includes(q.toLowerCase()) ||
      event.location.toLowerCase().includes(q.toLowerCase());
  }

  return textMatchesTerms(combined, searchTerms);
}
