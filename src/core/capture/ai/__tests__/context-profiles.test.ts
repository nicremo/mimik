import { beforeEach, describe, expect, it, vi } from 'vitest';

const store: Record<string, unknown> = {};

vi.mock('@/lib/browser-api', () => ({
  localStorage: {
    get: (keys: string[]) => Promise.resolve(Object.fromEntries(keys.map((k) => [k, store[k]]))),
    set: (items: Record<string, unknown>) => {
      Object.assign(store, items);
      return Promise.resolve();
    },
  },
}));

import {
  type ContextProfile,
  createEmptyProfile,
  getContextForUrl,
  getContextForUrls,
  loadContextProfiles,
  saveContextProfiles,
} from '../context-profiles';

function profile(overrides: Partial<ContextProfile>): ContextProfile {
  return { id: 'id', name: 'n', urlPattern: '', context: '', enabled: true, ...overrides };
}

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
});

describe('createEmptyProfile', () => {
  it('returns an enabled blank profile with an id', () => {
    const p = createEmptyProfile();
    expect(p.enabled).toBe(true);
    expect(p.id).toBeTruthy();
    expect(p.name).toBe('');
  });
});

describe('load/save round-trip', () => {
  it('persists and reads back profiles', async () => {
    const profiles = [profile({ id: 'a', name: 'BLUNATECH', urlPattern: 'app.blunatech.com', context: 'ctx' })];
    await saveContextProfiles(profiles);
    expect(await loadContextProfiles()).toEqual(profiles);
  });

  it('returns the built-in default profiles when nothing stored', async () => {
    const profiles = await loadContextProfiles();
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles.some((p) => p.urlPattern === 'app.blunatech.com')).toBe(true);
  });

  it('respects an explicitly saved empty list', async () => {
    await saveContextProfiles([]);
    expect(await loadContextProfiles()).toEqual([]);
  });
});

describe('getContextForUrl', () => {
  it('matches host against the pattern', async () => {
    await saveContextProfiles([profile({ urlPattern: 'app.blunatech.com', context: 'BLUNATECH knowledge' })]);
    expect(await getContextForUrl('https://app.blunatech.com/dashboard')).toBe('BLUNATECH knowledge');
  });

  it('matches a bare domain pattern against a subdomain host', async () => {
    await saveContextProfiles([profile({ urlPattern: 'blunatech.com', context: 'ctx' })]);
    expect(await getContextForUrl('https://app.blunatech.com/x')).toBe('ctx');
  });

  it('returns null for non-matching urls', async () => {
    await saveContextProfiles([profile({ urlPattern: 'app.blunatech.com', context: 'ctx' })]);
    expect(await getContextForUrl('https://github.com/foo')).toBeNull();
  });

  it('ignores disabled profiles', async () => {
    await saveContextProfiles([profile({ urlPattern: 'blunatech.com', context: 'ctx', enabled: false })]);
    expect(await getContextForUrl('https://app.blunatech.com')).toBeNull();
  });

  it('ignores profiles with empty context', async () => {
    await saveContextProfiles([profile({ urlPattern: 'blunatech.com', context: '   ' })]);
    expect(await getContextForUrl('https://app.blunatech.com')).toBeNull();
  });

  it('returns null when url is undefined', async () => {
    await saveContextProfiles([profile({ urlPattern: 'blunatech.com', context: 'ctx' })]);
    expect(await getContextForUrl(undefined)).toBeNull();
  });
});

describe('getContextForUrls', () => {
  it('picks the profile matching the most urls', async () => {
    await saveContextProfiles([
      profile({ id: 'a', urlPattern: 'blunatech.com', context: 'BLUNATECH' }),
      profile({ id: 'b', urlPattern: 'github.com', context: 'GitHub' }),
    ]);
    const urls = ['https://app.blunatech.com/a', 'https://app.blunatech.com/b', 'https://github.com/x'];
    expect(await getContextForUrls(urls)).toBe('BLUNATECH');
  });

  it('returns null when no url matches', async () => {
    await saveContextProfiles([profile({ urlPattern: 'blunatech.com', context: 'ctx' })]);
    expect(await getContextForUrls(['https://example.com'])).toBeNull();
  });
});
