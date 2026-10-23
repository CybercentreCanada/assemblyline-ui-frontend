import { act, renderHook, waitFor } from '@testing-library/react';
import { createSearchParamsStore, SEARCH_PARAM_BLUEPRINTS_MAP } from 'features/search-params';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const makeBlueprints = () => ({
  page: SEARCH_PARAM_BLUEPRINTS_MAP.number(1),
  query: SEARCH_PARAM_BLUEPRINTS_MAP.string('')
});

const makeWrapper = (initialEntries: string[], storageKey?: string) => {
  const { SearchParamsProvider, useSearchParams } = createSearchParamsStore();
  const params = makeBlueprints();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <SearchParamsProvider params={params} storageKey={storageKey}>
        {children}
      </SearchParamsProvider>
    </MemoryRouter>
  );

  return { wrapper, useSearchParams };
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

//*****************************************************************************************
// useSearchParams (with a provider)
//*****************************************************************************************

describe('useSearchParams (inside a SearchParamsProvider)', () => {
  it('resolves default values when no query params are present', () => {
    const { wrapper, useSearchParams } = makeWrapper(['/list']);
    const { result } = renderHook(() => useSearchParams(), { wrapper });

    expect(result.current.search.toObject()).toEqual({ page: 1, query: '' });
  });

  it('resolves values from the initial location search', () => {
    const { wrapper, useSearchParams } = makeWrapper(['/list?page=5&query=abc']);
    const { result } = renderHook(() => useSearchParams(), { wrapper });

    expect(result.current.search.toObject()).toEqual({ page: 5, query: 'abc' });
  });

  it('updates the snapshot when setSearchParams is called', async () => {
    const { wrapper, useSearchParams } = makeWrapper(['/list']);
    const { result } = renderHook(() => useSearchParams(), { wrapper });

    act(() => {
      result.current.setSearchParams(new URLSearchParams('page=9'));
    });

    await waitFor(() => expect(result.current.search.get('page')).toBe(9));
  });

  it('updates the snapshot when setSearchObject is called', async () => {
    const { wrapper, useSearchParams } = makeWrapper(['/list']);
    const { result } = renderHook(() => useSearchParams(), { wrapper });

    act(() => {
      result.current.setSearchObject({ page: 2, query: 'hi' });
    });

    await waitFor(() => expect(result.current.search.toObject()).toEqual({ page: 2, query: 'hi' }));
  });
});

//*****************************************************************************************
// useSearchParams (without a provider)
//*****************************************************************************************

describe('useSearchParams (without a SearchParamsProvider)', () => {
  it('falls back to an empty snapshot store without throwing', () => {
    const { useSearchParams } = createSearchParamsStore();
    const { result } = renderHook(() => useSearchParams());

    expect(() => result.current.search.toObject()).not.toThrow();
    expect(result.current.search.toObject()).toEqual({});
  });

  it('exposes no-op setters that do not throw when invoked', () => {
    const { useSearchParams } = createSearchParamsStore();
    const { result } = renderHook(() => useSearchParams());

    expect(() => result.current.setSearchParams(new URLSearchParams())).not.toThrow();
    expect(() => result.current.setSearchObject({})).not.toThrow();
    expect(() => result.current.setDefaultParams({})).not.toThrow();
    expect(() => result.current.clearDefaultParams()).not.toThrow();
  });
});

//*****************************************************************************************
// setDefaultParams / clearDefaultParams (localStorage persistence)
//*****************************************************************************************

describe('useSearchParams setDefaultParams / clearDefaultParams', () => {
  it('persists non-ephemeral delta values to localStorage', async () => {
    const { wrapper, useSearchParams } = makeWrapper(['/list'], 'test-storage-key');
    const { result } = renderHook(() => useSearchParams(), { wrapper });

    act(() => {
      result.current.setDefaultParams({ page: 4, query: 'stored' });
    });

    await waitFor(() => expect(localStorage.getItem('test-storage-key')).toBe('page=4&query=stored'));
  });

  it('clears the stored defaults from localStorage', async () => {
    const { wrapper, useSearchParams } = makeWrapper(['/list'], 'test-storage-key');
    const { result } = renderHook(() => useSearchParams(), { wrapper });

    act(() => {
      result.current.setDefaultParams({ page: 4, query: 'stored' });
    });
    await waitFor(() => expect(localStorage.getItem('test-storage-key')).not.toBeNull());

    act(() => {
      result.current.clearDefaultParams();
    });

    await waitFor(() => expect(localStorage.getItem('test-storage-key')).toBeNull());
  });
});
