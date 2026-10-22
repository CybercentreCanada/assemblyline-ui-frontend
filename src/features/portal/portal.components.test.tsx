import { fireEvent, render, within } from '@testing-library/react';
import { createReversePortalNode, InPortal, OutPortal } from 'features/portal';
import { useEffect, useState } from 'react';

describe('<OutPortal />', () => {
  it('keeps the host attached to the remaining outlet when another outlet unmounts', () => {
    const node = createReversePortalNode();
    const renderOutlets = (showFirstOutlet: boolean) => (
      <>
        {showFirstOutlet && <OutPortal key="first" node={node} />}
        <OutPortal key="second" node={node} />
      </>
    );
    const { container, rerender } = render(renderOutlets(true));
    const outlets = container.querySelectorAll('[data-testid="reverse-portal-outlet"]');
    const secondOutlet = outlets[1];

    expect(node.hostEl.parentElement).toBe(secondOutlet);

    rerender(renderOutlets(false));

    const remainingOutlet = container.querySelector('[data-testid="reverse-portal-outlet"]');
    expect(node.hostEl.parentElement).toBe(remainingOutlet);
  });

  it('preserves child state and effects while replacing an outlet', () => {
    const node = createReversePortalNode();
    const onMount = vi.fn();
    const onCleanup = vi.fn();

    const StatefulChild = () => {
      const [count, setCount] = useState(0);

      useEffect(() => {
        onMount();
        return () => onCleanup();
      }, []);

      return <button onClick={() => setCount(value => value + 1)}>{count}</button>;
    };

    const renderPortals = (outlet: 'initial' | 'replacement' | null) => (
      <>
        <InPortal node={node}>
          <StatefulChild />
        </InPortal>
        {outlet && <OutPortal key={outlet} node={node} />}
      </>
    );

    const { rerender } = render(renderPortals('initial'));
    const originalButton = within(node.hostEl).getByRole('button');
    fireEvent.click(originalButton);

    expect(originalButton.textContent).toBe('1');
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onCleanup).not.toHaveBeenCalled();

    rerender(renderPortals(null));

    expect(within(node.hostEl).getByRole('button')).toBe(originalButton);
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onCleanup).not.toHaveBeenCalled();

    rerender(renderPortals('replacement'));

    expect(within(node.hostEl).getByRole('button')).toBe(originalButton);
    expect(originalButton.textContent).toBe('1');
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onCleanup).not.toHaveBeenCalled();
  });
});
