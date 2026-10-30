import { DEFAULT_APP_INTERFACE_STORE } from 'app/core.interface';
import {
  getHighlighterKey,
  hasHighlighterKey,
  hasHighlighterKeys,
  toggleHighlighterKey
} from 'layout/highlighter/highlighter.utils';
import { describe, expect, it } from 'vitest';

const createInterfaceStore = (): AppInterfaceStore => ({
  ...DEFAULT_APP_INTERFACE_STORE,
  highlighter: {
    keys: new Set(),
    links: {},
    related: new Set()
  }
});

//*****************************************************************************************
// getHighlighterKey
//*****************************************************************************************
describe('getHighlighterKey', () => {
  it('joins a type and value with the key separator', () => {
    expect(getHighlighterKey('tag', 'network')).toBe('tag__network');
  });

  it('supports empty type values', () => {
    expect(getHighlighterKey('', 'network')).toBe('__network');
  });

  it('supports empty key values', () => {
    expect(getHighlighterKey('tag', '')).toBe('tag__');
  });
});

//*****************************************************************************************
// hasHighlighterKey
//*****************************************************************************************
describe('hasHighlighterKey', () => {
  it('returns true for a directly highlighted key', () => {
    const store = createInterfaceStore();
    store.highlighter.keys.add('tag__network');

    expect(hasHighlighterKey('tag__network')(store)).toBe(true);
  });

  it('returns true for a related highlighted key', () => {
    const store = createInterfaceStore();
    store.highlighter.related.add('file__hash');

    expect(hasHighlighterKey('file__hash')(store)).toBe(true);
  });

  it('returns false when neither highlight set contains the key', () => {
    expect(hasHighlighterKey('tag__network')(createInterfaceStore())).toBe(false);
  });
});

//*****************************************************************************************
// hasHighlighterKeys
//*****************************************************************************************
describe('hasHighlighterKeys', () => {
  it('returns true when one key is highlighted', () => {
    const store = createInterfaceStore();
    store.highlighter.keys.add('tag__network');

    expect(hasHighlighterKeys(['tag__network', 'tag__file'])(store)).toBe(true);
  });

  it('returns false when no keys are highlighted', () => {
    expect(hasHighlighterKeys(['tag__network'])(createInterfaceStore())).toBe(false);
  });

  it('returns false for an empty key list', () => {
    expect(hasHighlighterKeys([])(createInterfaceStore())).toBe(false);
  });
});

//*****************************************************************************************
// toggleHighlighterKey
//*****************************************************************************************
describe('toggleHighlighterKey', () => {
  it('adds an unhighlighted key and its related keys', () => {
    const store = createInterfaceStore();
    store.highlighter.links = { tag__network: ['file__hash'] };

    expect(toggleHighlighterKey('tag__network')(store)).toBe(store);
    expect(store.highlighter.keys).toEqual(new Set(['tag__network']));
    expect(store.highlighter.related).toEqual(new Set(['file__hash']));
  });

  it('removes an already highlighted key', () => {
    const store = createInterfaceStore();
    store.highlighter.keys.add('tag__network');

    toggleHighlighterKey('tag__network')(store);

    expect(store.highlighter.keys).toEqual(new Set());
  });

  it('does not add related keys when the map is empty', () => {
    const store = createInterfaceStore();

    toggleHighlighterKey('tag__network')(store);

    expect(store.highlighter.related).toEqual(new Set());
  });
});
