import { render } from '@testing-library/react';
import { createReversePortalNode, OutPortal } from 'features/portal';

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
});
