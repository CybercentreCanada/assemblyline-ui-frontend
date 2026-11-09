import { act, cleanup, renderHook } from '@testing-library/react';
import useALContext from 'core/config/useALContext';
import type { FeatureFlagStore } from 'core/feature-flag/feature-flag.models';
import {
  AppFeatureFlagProvider,
  AppFeatureFlagStoreProvider,
  useAppFeatureFlagStoreApi
} from 'core/feature-flag/feature-flag.providers';
import type { PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('core/config/useALContext', () => ({ default: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.mocked(useALContext).mockReset();
  localStorage.clear();
});

const setUser = (user: { is_admin: boolean } | null) => {
  vi.mocked(useALContext).mockReturnValue({ user } as ReturnType<typeof useALContext>);
};

describe('AppFeatureFlagProvider', () => {
  it('loads persisted flags for administrators and exposes its children', () => {
    setUser({ is_admin: true });
    localStorage.setItem('flags', JSON.stringify({ flags: [{ flag: 'demo', enabled: true }] }));
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: false }] };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppFeatureFlagStoreProvider data={defaults}>
        <AppFeatureFlagProvider storageKey="flags" defaultState={defaults}>
          {children}
        </AppFeatureFlagProvider>
      </AppFeatureFlagStoreProvider>
    );

    const { result } = renderHook(() => useAppFeatureFlagStoreApi(), { wrapper });

    expect(result.current.getState()).toEqual({ flags: [{ flag: 'demo', enabled: true }] });
    expect(defaults.flags[0].enabled).toBe(false);
  });

  it('loads the provided defaults when no saved flags exist', () => {
    setUser({ is_admin: true });
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: false }] };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppFeatureFlagStoreProvider>
        <AppFeatureFlagProvider storageKey="flags" defaultState={defaults}>
          {children}
        </AppFeatureFlagProvider>
      </AppFeatureFlagStoreProvider>
    );

    const { result } = renderHook(() => useAppFeatureFlagStoreApi(), { wrapper });

    expect(result.current.getState()).toEqual(defaults);
  });

  it.each([{ is_admin: false }, null])('does not load or save persisted flags for unauthorized users: %s', user => {
    setUser(user);
    const defaults: FeatureFlagStore = { flags: [] };
    const saved = JSON.stringify({ flags: [{ flag: 'saved', enabled: true }] });
    localStorage.setItem('flags', saved);
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppFeatureFlagStoreProvider data={defaults}>
        <AppFeatureFlagProvider storageKey="flags" defaultState={defaults}>
          {children}
        </AppFeatureFlagProvider>
      </AppFeatureFlagStoreProvider>
    );
    const { result } = renderHook(() => useAppFeatureFlagStoreApi(), { wrapper });

    expect(result.current.getState()).toEqual(defaults);
    act(() => result.current.setState({ flags: [{ flag: 'demo', enabled: true }] }));

    expect(localStorage.getItem('flags')).toBe(saved);
  });

  it('saves administrator updates and stops saving after unmount', () => {
    setUser({ is_admin: true });
    const defaults: FeatureFlagStore = { flags: [] };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppFeatureFlagStoreProvider>
        <AppFeatureFlagProvider storageKey="flags" defaultState={defaults}>
          {children}
        </AppFeatureFlagProvider>
      </AppFeatureFlagStoreProvider>
    );
    const { result, unmount } = renderHook(() => useAppFeatureFlagStoreApi(), { wrapper });
    const store = result.current;
    const enabled: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: true }] };

    act(() => store.setState(enabled));
    expect(localStorage.getItem('flags')).toBe(JSON.stringify(enabled));
    unmount();
    localStorage.removeItem('flags');
    act(() => store.setState(defaults));

    expect(localStorage.getItem('flags')).toBeNull();
  });

  it('switches storage keys without keeping the previous subscription', () => {
    setUser({ is_admin: true });
    const defaults: FeatureFlagStore = { flags: [] };
    let storageKey = 'first';
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppFeatureFlagStoreProvider>
        <AppFeatureFlagProvider storageKey={storageKey} defaultState={defaults}>
          {children}
        </AppFeatureFlagProvider>
      </AppFeatureFlagStoreProvider>
    );
    const { result, rerender } = renderHook(() => useAppFeatureFlagStoreApi(), { wrapper });
    const first: FeatureFlagStore = { flags: [{ flag: 'first', enabled: true }] };

    act(() => result.current.setState(first));
    storageKey = 'second';
    rerender();
    const second: FeatureFlagStore = { flags: [{ flag: 'second', enabled: true }] };
    act(() => result.current.setState(second));

    expect(localStorage.getItem('first')).toBe(JSON.stringify(first));
    expect(localStorage.getItem('second')).toBe(JSON.stringify(second));
  });

  it('stops saving when administrator privileges are revoked', () => {
    setUser({ is_admin: true });
    const defaults: FeatureFlagStore = { flags: [] };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AppFeatureFlagStoreProvider>
        <AppFeatureFlagProvider storageKey="flags" defaultState={defaults}>
          {children}
        </AppFeatureFlagProvider>
      </AppFeatureFlagStoreProvider>
    );
    const { result, rerender } = renderHook(() => useAppFeatureFlagStoreApi(), { wrapper });
    const saved: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: true }] };

    act(() => result.current.setState(saved));
    setUser({ is_admin: false });
    rerender();
    act(() => result.current.setState(defaults));

    expect(localStorage.getItem('flags')).toBe(JSON.stringify(saved));
  });

  it('keeps only one active persistence subscription in Strict Mode', () => {
    setUser({ is_admin: true });
    const defaults: FeatureFlagStore = { flags: [] };
    const wrapper = ({ children }: PropsWithChildren) => (
      <StrictMode>
        <AppFeatureFlagStoreProvider>
          <AppFeatureFlagProvider storageKey="flags" defaultState={defaults}>
            {children}
          </AppFeatureFlagProvider>
        </AppFeatureFlagStoreProvider>
      </StrictMode>
    );
    const { result } = renderHook(() => useAppFeatureFlagStoreApi(), { wrapper });
    const save = vi.spyOn(Storage.prototype, 'setItem');

    act(() => result.current.setState({ flags: [{ flag: 'demo', enabled: true }] }));

    expect(save).toHaveBeenCalledTimes(1);
  });
});
