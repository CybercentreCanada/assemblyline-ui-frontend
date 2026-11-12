import { act, cleanup, renderHook } from '@testing-library/react';
import { useIsFeatureEnabled, useToggleFeatureFlag, useUpdateFeatureFlag } from 'core/feature-flag/feature-flag.hooks';
import type { FeatureFlagStore } from 'core/feature-flag/feature-flag.models';
import { AppFeatureFlagStoreProvider, useAppFeatureFlagStore } from 'core/feature-flag/feature-flag.providers';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('core/config/useALContext', () => ({ default: vi.fn() }));

afterEach(cleanup);

const renderFlags = (defaults: FeatureFlagStore, flag = 'demo') => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <AppFeatureFlagStoreProvider data={defaults}>{children}</AppFeatureFlagStoreProvider>
  );

  return renderHook(
    () => ({
      enabled: useIsFeatureEnabled(flag),
      update: useUpdateFeatureFlag(),
      toggle: useToggleFeatureFlag(),
      state: useAppFeatureFlagStore(store => store)
    }),
    { wrapper }
  );
};

describe('useIsFeatureEnabled', () => {
  it.each([true, false])('returns the enabled state %s for a known flag', enabled => {
    const { result } = renderFlags({ flags: [{ flag: 'demo', enabled }] });

    expect(result.current.enabled).toBe(enabled);
  });

  it('returns false for an unknown flag in a populated store', () => {
    const { result } = renderFlags({ flags: [{ flag: 'other', enabled: true }] });

    expect(result.current.enabled).toBe(false);
  });

  it('returns false for an empty store', () => {
    const { result } = renderFlags({ flags: [] });

    expect(result.current.enabled).toBe(false);
  });
});

describe('useUpdateFeatureFlag', () => {
  it.each([0, 1])('updates the flag at index %s without changing other flags or defaults', index => {
    const defaults: FeatureFlagStore = {
      flags: [
        { flag: 'first', enabled: false },
        { flag: 'last', enabled: false }
      ]
    };
    const flag = defaults.flags[index].flag;
    const { result } = renderFlags(defaults, flag);

    act(() => result.current.update(flag, true));

    expect(result.current.enabled).toBe(true);
    expect(result.current.state.flags[index]).not.toBe(defaults.flags[index]);
    expect(result.current.state.flags[1 - index]).toBe(defaults.flags[1 - index]);
    expect(defaults.flags.every(entry => !entry.enabled)).toBe(true);
  });

  it.each([true, false])('adds an unknown flag with enabled state %s', enabled => {
    const { result } = renderFlags({ flags: [] });

    act(() => result.current.update('demo', enabled));

    expect(result.current.state.flags).toEqual([{ flag: 'demo', enabled }]);
  });

  it('disables an enabled flag without adding duplicate entries', () => {
    const { result } = renderFlags({ flags: [{ flag: 'demo', enabled: true }] });

    act(() => result.current.update('demo', false));

    expect(result.current.state.flags).toEqual([{ flag: 'demo', enabled: false }]);
    expect(result.current.enabled).toBe(false);
  });

  it('starts with the original defaults after unmounting and remounting', () => {
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: false }] };
    const first = renderFlags(defaults);

    act(() => first.result.current.update('demo', true));
    expect(first.result.current.enabled).toBe(true);
    first.unmount();

    const second = renderFlags(defaults);

    expect(second.result.current.enabled).toBe(false);
  });
});

describe('useToggleFeatureFlag', () => {
  it.each([true, false])('toggles state %s without changing defaults', enabled => {
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled }] };
    const { result } = renderFlags(defaults);

    act(() => result.current.toggle('demo'));

    expect(result.current.enabled).toBe(!enabled);
    expect(defaults.flags[0].enabled).toBe(enabled);
  });

  it('adds an enabled flag without changing existing entries', () => {
    const { result } = renderFlags({ flags: [{ flag: 'other', enabled: false }] });

    act(() => result.current.toggle('demo'));

    expect(result.current.state.flags).toEqual([
      { flag: 'other', enabled: false },
      { flag: 'demo', enabled: true }
    ]);
  });

  it('adds an enabled flag to an empty store', () => {
    const { result } = renderFlags({ flags: [] });

    act(() => result.current.toggle('demo'));

    expect(result.current.enabled).toBe(true);
    expect(result.current.state.flags).toEqual([{ flag: 'demo', enabled: true }]);
  });

  it('preserves unrelated flags when toggling an existing flag', () => {
    const { result } = renderFlags({
      flags: [
        { flag: 'demo', enabled: false },
        { flag: 'other', enabled: true }
      ]
    });

    act(() => result.current.toggle('demo'));

    expect(result.current.state.flags).toEqual([
      { flag: 'demo', enabled: true },
      { flag: 'other', enabled: true }
    ]);
  });
});

describe('feature flag hook isolation', () => {
  it('keeps separate provider instances independent', () => {
    const defaults: FeatureFlagStore = { flags: [{ flag: 'demo', enabled: false }] };
    const first = renderFlags(defaults);
    const second = renderFlags(defaults);

    act(() => first.result.current.update('demo', true));

    expect(first.result.current.enabled).toBe(true);
    expect(second.result.current.enabled).toBe(false);
  });

  it('keeps update and toggle callback references stable after updates', () => {
    const { result } = renderFlags({ flags: [] });
    const { update, toggle } = result.current;

    act(() => update('demo', true));

    expect(result.current.update).toBe(update);
    expect(result.current.toggle).toBe(toggle);
  });
});
