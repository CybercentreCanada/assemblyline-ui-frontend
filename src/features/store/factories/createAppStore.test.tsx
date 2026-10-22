import { render, screen } from '@testing-library/react';
import { createAppStore } from 'features/store';
import { useEffect } from 'react';
import { describe, expect, test, vi } from 'vitest';

type TestStore = { count: number };

const { StoreProvider, useSetStore, useStore } = createAppStore<TestStore>({ count: 0 });

const Counter = () => {
  const count = useStore(s => s.count);

  return <div id="count">{count}</div>;
};

const ChildThatSetsCount = () => {
  const setStore = useSetStore();

  useEffect(() => {
    setStore({ count: 5 });
  }, [setStore]);

  return <Counter />;
};

describe('createAppStore StoreProvider', () => {
  test('does not reapply the initial data over changes made by child effects', () => {
    render(
      <StoreProvider data={{ count: 1 }}>
        <ChildThatSetsCount />
      </StoreProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('5');
  });

  test('applies data again when it changes', () => {
    const { rerender } = render(
      <StoreProvider data={{ count: 1 }}>
        <Counter />
      </StoreProvider>
    );

    rerender(
      <StoreProvider data={{ count: 2 }}>
        <Counter />
      </StoreProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  test('runs an initial updater once', () => {
    const updater = vi.fn(() => ({ count: 3 }));

    render(
      <StoreProvider data={updater}>
        <Counter />
      </StoreProvider>
    );

    expect(updater).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('count').textContent).toBe('3');
  });
});
