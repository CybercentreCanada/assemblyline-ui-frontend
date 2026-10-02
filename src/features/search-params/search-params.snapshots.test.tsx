import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import { describe, expect, it } from 'vitest';

const makeSnapshot = () =>
  new SearchParamEngine({
    page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1),
    query: SEARCH_PARAM_BLUEPRINTS_MAP.string('').ephemeral(),
    state: SEARCH_PARAM_BLUEPRINTS_MAP.string('').source('state').ignored()
  }).full({ page: 3, query: 'abc', state: 'xyz' });

//*****************************************************************************************
// Key introspection
//*****************************************************************************************

describe('SearchParamSnapshot.defaults', () => {
  it('returns a snapshot reset to the blueprint default values', () => {
    const snapshot = makeSnapshot();
    expect(snapshot.defaults().toObject()).toEqual({ page: 1, query: '', state: '' });
  });
});

describe('SearchParamSnapshot.ephemeralKeys', () => {
  it('returns keys marked ephemeral', () => {
    expect(makeSnapshot().ephemeralKeys()).toEqual(['query']);
  });
});

describe('SearchParamSnapshot.ignoredKeys', () => {
  it('returns keys marked ignored', () => {
    expect(makeSnapshot().ignoredKeys()).toEqual(['state']);
  });
});

describe('SearchParamSnapshot.lockedKeys', () => {
  it('returns an empty array when no keys are locked', () => {
    expect(makeSnapshot().lockedKeys()).toEqual([]);
  });
});

describe('SearchParamSnapshot.sourceKeys', () => {
  it('returns keys resolved from the search source', () => {
    expect(makeSnapshot().sourceKeys('search')).toEqual(['page', 'query']);
  });

  it('returns keys resolved from the state source', () => {
    expect(makeSnapshot().sourceKeys('state')).toEqual(['state']);
  });
});

//*****************************************************************************************
// Value access
//*****************************************************************************************

describe('SearchParamSnapshot.has', () => {
  it('returns true when the key exists in the runtime map', () => {
    expect(makeSnapshot().has('page')).toBe(true);
  });

  it('returns false for keys not in the runtime map', () => {
    expect(makeSnapshot().has('missing' as never)).toBe(false);
  });
});

describe('SearchParamSnapshot.get', () => {
  it('returns the current value for a known key', () => {
    expect(makeSnapshot().get('page')).toBe(3);
  });

  it('returns null for an unknown key', () => {
    expect(makeSnapshot().get('missing' as never)).toBeNull();
  });
});

describe('SearchParamSnapshot.pick', () => {
  it('returns a new snapshot containing only the picked keys', () => {
    expect(makeSnapshot().pick(['page']).toObject()).toEqual({ page: 3 });
  });
});

describe('SearchParamSnapshot.omit', () => {
  it('returns a new snapshot excluding the omitted keys', () => {
    expect(makeSnapshot().omit(['page']).toObject()).toEqual({ query: 'abc', state: 'xyz' });
  });
});

describe('SearchParamSnapshot.set', () => {
  it('replaces values with the provided object', () => {
    const snapshot = makeSnapshot().set({ page: 9, query: 'z', state: 'y' });
    expect(snapshot.toObject()).toEqual({ page: 9, query: 'z', state: 'y' });
  });

  it('replaces values using an updater function', () => {
    const snapshot = makeSnapshot().set(prev => ({ ...prev, page: prev.page + 1 }));
    expect(snapshot.get('page')).toBe(4);
  });
});

//*****************************************************************************************
// Location Conversion
//*****************************************************************************************

describe('SearchParamSnapshot.toLocationSearch', () => {
  it('serializes only search-sourced params as a query string', () => {
    expect(makeSnapshot().toLocationSearch()).toBe('page=3&query=abc');
  });
});

describe('SearchParamSnapshot.toLocationState', () => {
  it('serializes only state-sourced params as an object', () => {
    expect(makeSnapshot().toLocationState()).toEqual({ state: 'xyz' });
  });
});

describe('SearchParamSnapshot.toLocationTransient', () => {
  it('returns an empty object when no transient-sourced params exist', () => {
    expect(makeSnapshot().toLocationTransient()).toEqual({});
  });
});

describe('SearchParamSnapshot.toObject', () => {
  it('returns a deep clone of the current values', () => {
    const snapshot = makeSnapshot();
    const obj = snapshot.toObject();
    expect(obj).toEqual({ page: 3, query: 'abc', state: 'xyz' });
    expect(obj).not.toBe(snapshot.values);
  });
});

describe('SearchParamSnapshot.toParams', () => {
  it('serializes all params into a URLSearchParams instance', () => {
    const params = makeSnapshot().toParams();
    expect(params.get('page')).toBe('3');
    expect(params.get('query')).toBe('abc');
    expect(params.get('state')).toBe('xyz');
  });
});

describe('SearchParamSnapshot.toString', () => {
  it('serializes all params into a sorted query string', () => {
    expect(makeSnapshot().toString()).toBe('page=3&query=abc&state=xyz');
  });
});
