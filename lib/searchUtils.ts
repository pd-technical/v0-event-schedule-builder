/**
 * Search utilities: ranked matching with exact > substring > synonym > fuzzy (typos).
 * Synonyms and related terms expand the query; fuzzy is tightened to reduce overmatching.
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

/** Stricter fuzzy: 1 edit for short words; 2 edits only when lengths are close (typos, not unrelated). */
function maxEditDistance(queryWord: string, textWord: string): number {
  const qLen = queryWord.length;
  const tLen = textWord.length;
  const lenDiff = Math.abs(qLen - tLen);
  if (qLen <= 4 || tLen <= 4) return lenDiff <= 1 ? 1 : 0;
  if (lenDiff > 2) return 0; // avoid matching very different lengths
  return qLen <= 7 ? 2 : 1;
}

/** True if textWord is within allowed edit distance of queryWord (for typos only). */
function fuzzyMatchWord(queryWord: string, textWord: string): boolean {
  if (queryWord.length < 2 || textWord.length < 2) return queryWord === textWord;
  const maxDist = maxEditDistance(queryWord, textWord);
  return maxDist >= 0 && levenshtein(queryWord, textWord) <= maxDist;
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

/** Original query words only (normalized, no synonym expansion). */
function getQueryWords(query: string): string[] {
  return toWords(query.trim());
}

/** Expand query into all terms to match: query words + synonyms + related. */
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

/** Match tier: 1 = best (exact), 4 = weakest (fuzzy only). */
export type MatchTier = 1 | 2 | 3 | 4;

export interface RankedMatch<T extends SearchableEvent = SearchableEvent> {
  event: T;
  tier: MatchTier;
  /** Higher = better within same tier (e.g. more substring matches). */
  tiebreaker: number;
}

/**
 * Computes the best match tier and tiebreaker for one event.
 * Tier 1: exact phrase or exact event name match.
 * Tier 2: substring match of original query words.
 * Tier 3: substring match of synonym/related terms only.
 * Tier 4: fuzzy (typo) match of query words only.
 */
function scoreEvent<T extends SearchableEvent>(event: T, query: string): RankedMatch<T> | null {
  const q = query.trim();
  if (!q) return { event, tier: 1, tiebreaker: 0 };

  const combined = [event.name, event.description, event.location].join(" ").toLowerCase();
  const combinedNorm = [event.name, event.description, event.location]
    .map((s) => s.toLowerCase().replace(/\s+/g, " ").trim())
    .join(" ");
  const queryLower = q.toLowerCase();
  const queryWords = getQueryWords(q);
  const searchTerms = getSearchTerms(q);
  const textWords = toWords(combined);

  const queryWordsSet = new Set(queryWords);
  /** Synonym-only terms (not the original query words). */
  const synonymTerms = searchTerms.filter((t) => !queryWordsSet.has(t));

  // Tier 1: exact phrase or exact event name
  if (combinedNorm.includes(queryLower) || toWords(event.name).join(" ") === toWords(q).join(" ")) {
    return { event, tier: 1, tiebreaker: 1 };
  }

  // Tier 2: substring match of original query words
  let substringCount = 0;
  for (const w of queryWords) {
    if (w.length < 2) continue;
    if (combined.includes(w)) substringCount++;
  }
  if (substringCount > 0) {
    return { event, tier: 2, tiebreaker: substringCount };
  }

  // Tier 3: synonym/related term as exact substring (no fuzzy)
  let synonymCount = 0;
  for (const term of synonymTerms) {
    if (term.length < 2) continue;
    if (combined.includes(term)) synonymCount++;
  }
  if (synonymCount > 0) {
    return { event, tier: 3, tiebreaker: synonymCount };
  }

  // Tier 4: fuzzy match of query words only (typos)
  let fuzzyCount = 0;
  for (const qw of queryWords) {
    if (qw.length < 2) continue;
    for (const tw of textWords) {
      if (fuzzyMatchWord(qw, tw)) {
        fuzzyCount++;
        break;
      }
    }
  }
  if (fuzzyCount > 0) {
    return { event, tier: 4, tiebreaker: fuzzyCount };
  }

  return null;
}

export interface SearchableEvent {
  name: string;
  description: string;
  location: string;
}

/**
 * Returns events that match the search query, sorted by relevance.
 * Order: exact phrase/name (1) > substring (2) > synonym (3) > fuzzy/typo (4).
 * Fuzzy matching is restricted to similar-length words to reduce overmatching.
 * Preserves input type (e.g. Event[] in → Event[] out).
 */
export function rankedEventMatchesSearch<T extends SearchableEvent>(
  events: T[],
  searchQuery: string
): T[] {
  const q = searchQuery.trim();
  if (!q) return [...events];

  const scored: RankedMatch<T>[] = [];
  for (const event of events) {
    const s = scoreEvent(event, q);
    if (s) scored.push(s);
  }
  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return b.tiebreaker - a.tiebreaker;
  });
  return scored.map((s) => s.event);
}

/**
 * Returns true if the event matches the search query (any tier).
 * Uses the same ranking logic as rankedEventMatchesSearch.
 */
export function eventMatchesSearch(
  event: SearchableEvent,
  searchQuery: string
): boolean {
  return rankedEventMatchesSearch([event], searchQuery).length > 0;
}
