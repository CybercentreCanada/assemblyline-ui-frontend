import {
  addBlockedPage,
  clearBlockedPages,
  getBlockedPages,
  getDefaultNavigationStore,
  getDefaultRouterStore,
  hasBlockedPages,
  removeBlockedPage,
  setBlockedPage
} from 'core/router';
import { makePage } from 'core/router/tests/test-defaults';
import { describe, expect, it } from 'vitest';

describe('addBlockedPage', () => {
  it('adds a blocker entry with the given reason', () => {
    const store = { ...getDefaultNavigationStore(), pages: { r1: makePage('/r1') } };
    const next = addBlockedPage(store, 'r1', 'unsaved_changes');
    expect(next.blockedPages.r1).toBe('unsaved_changes');
  });

  it('defaults reason to unsaved_changes', () => {
    const store = { ...getDefaultNavigationStore() };
    const next = addBlockedPage(store, 'r1');
    expect(next.blockedPages.r1).toBe('unsaved_changes');
  });

  it('does nothing when pageKey is falsy', () => {
    const store = { ...getDefaultNavigationStore() };
    const next = addBlockedPage(store, null);
    expect(next.blockedPages).toEqual({});
  });
});

describe('removeBlockedPage', () => {
  it('removes the blocker entry', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    const next = removeBlockedPage(store, 'r1');
    expect('r1' in next.blockedPages).toBe(false);
  });

  it('does nothing when the key does not exist', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: {} };
    const next = removeBlockedPage(store, 'missing');
    expect(next.blockedPages).toEqual({});
  });
});

describe('setBlockedPage', () => {
  it('adds a blocker when reason is truthy', () => {
    const store = { ...getDefaultNavigationStore() };
    const next = setBlockedPage(store, 'r1', 'unsaved_changes');
    expect(next.blockedPages.r1).toBe('unsaved_changes');
  });

  it('removes a blocker when reason is null', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    const next = setBlockedPage(store, 'r1', null);
    expect('r1' in next.blockedPages).toBe(false);
  });
});

describe('getBlockedPages', () => {
  it('returns an empty array when there are no blocked pages', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: {} };
    expect(getBlockedPages(store)).toEqual([]);
  });

  it('returns entries for blocked pages', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    expect(getBlockedPages(store)).toEqual([['r1', 'unsaved_changes']]);
  });
});

describe('clearBlockedPages', () => {
  it('clears all blocked pages', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    const next = clearBlockedPages(store);
    expect(next.blockedPages).toEqual({});
  });
});

describe('hasBlockedPages', () => {
  it('returns true when a blocked page digest differs between stores', () => {
    const navigation = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1') },
      blockedPages: { r1: 'unsaved_changes' as const }
    };
    const router = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r2') } };
    expect(hasBlockedPages(navigation, router)).toBe(true);
  });

  it('returns false when blocked pages match between stores', () => {
    const page = makePage('/r1');
    const navigation = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: page },
      blockedPages: { r1: 'unsaved_changes' as const }
    };
    const router = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: { ...page } } };
    expect(hasBlockedPages(navigation, router)).toBe(false);
  });

  it('returns false when there are no blocked pages', () => {
    const navigation = { ...getDefaultNavigationStore(), blockedPages: {} };
    const router = { ...getDefaultRouterStore() };
    expect(hasBlockedPages(navigation, router)).toBe(false);
  });
});
