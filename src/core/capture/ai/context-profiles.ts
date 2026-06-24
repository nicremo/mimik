import { localStorage } from '@/lib/browser-api';

/**
 * A background context profile lets the user attach domain knowledge about an
 * app to the AI prompt. When a recorded step happens on a matching URL, the
 * profile's context is injected so the model can write far better descriptions
 * and titles (e.g. it knows what "BLUNATECH" is and what each screen does).
 */
export interface ContextProfile {
  id: string;
  /** Human label, e.g. "BLUNATECH". */
  name: string;
  /**
   * URL fragment to match against the step URL (host + path), case-insensitive.
   * e.g. "app.blunatech.com" or just "blunatech.com".
   */
  urlPattern: string;
  /** The background knowledge blob fed to the model. */
  context: string;
  enabled: boolean;
}

const STORAGE_KEY = 'contextProfiles';

// Keep the injected blob bounded so we never blow up the token budget.
const MAX_CONTEXT_CHARS = 6000;

export function createEmptyProfile(): ContextProfile {
  return { id: crypto.randomUUID(), name: '', urlPattern: '', context: '', enabled: true };
}

export async function loadContextProfiles(): Promise<ContextProfile[]> {
  const result = await localStorage.get([STORAGE_KEY]);
  const raw = result[STORAGE_KEY];
  return Array.isArray(raw) ? (raw as ContextProfile[]) : [];
}

export async function saveContextProfiles(profiles: ContextProfile[]): Promise<void> {
  await localStorage.set({ [STORAGE_KEY]: profiles });
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** True if the profile pattern matches the given URL (host or full URL). */
function matchesUrl(profile: ContextProfile, url: string): boolean {
  const pattern = normalize(profile.urlPattern);
  if (!pattern) return false;
  const target = normalize(url);
  if (!target) return false;
  // Match against both the full URL and the bare host so "blunatech.com" works
  // whether the user typed a host, an origin, or a full URL.
  let host = '';
  try {
    host = normalize(new URL(url).host);
  } catch {
    // url may be just a host/path; fall through to substring match on raw value.
  }
  return target.includes(pattern) || (host !== '' && host.includes(pattern));
}

function trimContext(context: string): string {
  const trimmed = context.trim();
  if (trimmed.length <= MAX_CONTEXT_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_CONTEXT_CHARS)}…`;
}

/** Returns the matching profile's context for a single step URL, or null. */
export async function getContextForUrl(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  const profiles = await loadContextProfiles();
  const match = profiles.find((p) => p.enabled && p.context.trim() && matchesUrl(p, url));
  return match ? trimContext(match.context) : null;
}

/**
 * Returns context for a set of step URLs (used for title generation). Picks the
 * profile that matches the most URLs so multi-domain guides still get the right
 * context.
 */
export async function getContextForUrls(urls: string[]): Promise<string | null> {
  if (urls.length === 0) return null;
  const profiles = await loadContextProfiles();
  const candidates = profiles.filter((p) => p.enabled && p.context.trim());
  if (candidates.length === 0) return null;

  let best: ContextProfile | null = null;
  let bestHits = 0;
  for (const profile of candidates) {
    const hits = urls.filter((u) => matchesUrl(profile, u)).length;
    if (hits > bestHits) {
      best = profile;
      bestHits = hits;
    }
  }
  return best ? trimContext(best.context) : null;
}
