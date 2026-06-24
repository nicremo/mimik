import { describe, expect, it } from 'vitest';
import { AI_LANGUAGES, getContextPrefix, getLanguageSuffix } from '../prompts';

describe('getContextPrefix', () => {
  it('returns empty string for null/undefined/blank', () => {
    expect(getContextPrefix(null)).toBe('');
    expect(getContextPrefix(undefined)).toBe('');
    expect(getContextPrefix('   ')).toBe('');
  });

  it('wraps the context and ends with a separator', () => {
    const prefix = getContextPrefix('BLUNATECH is a SaaS app.');
    expect(prefix).toContain('BLUNATECH is a SaaS app.');
    expect(prefix).toContain('Background knowledge');
    expect(prefix.endsWith('---\n\n')).toBe(true);
  });
});

describe('getLanguageSuffix', () => {
  it('returns empty string for English', () => {
    expect(getLanguageSuffix('en')).toBe('');
  });

  it('returns empty string for en-US', () => {
    expect(getLanguageSuffix('en-US')).toBe('');
  });

  it('returns Spanish suffix for es', () => {
    expect(getLanguageSuffix('es')).toContain('Spanish');
  });

  it('returns French suffix for fr', () => {
    expect(getLanguageSuffix('fr')).toContain('French');
  });

  it('returns Brazilian Portuguese suffix for pt-BR', () => {
    expect(getLanguageSuffix('pt-BR')).toContain('Brazilian Portuguese');
  });

  it('returns the locale code for unknown languages', () => {
    expect(getLanguageSuffix('sv')).toContain('sv');
  });

  it('includes IMPORTANT instruction', () => {
    const suffix = getLanguageSuffix('es');
    expect(suffix).toContain('IMPORTANT');
    expect(suffix).toContain('Write the description in');
  });
});

describe('AI_LANGUAGES', () => {
  it('has 4 supported languages', () => {
    expect(AI_LANGUAGES).toHaveLength(4);
  });

  it('includes English as first entry', () => {
    expect(AI_LANGUAGES[0]).toEqual({ code: 'en', label: 'English' });
  });

  it('each entry has code and label', () => {
    for (const lang of AI_LANGUAGES) {
      expect(lang.code).toBeTruthy();
      expect(lang.label).toBeTruthy();
    }
  });
});
