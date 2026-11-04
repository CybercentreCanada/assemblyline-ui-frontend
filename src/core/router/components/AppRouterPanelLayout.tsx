import { findNode, findPageKeyFromPanelKey, useAppRouterStore } from 'core/router';
import { OutPortal } from 'features/portal';
import { memo } from 'react';
import { MissingNodePage } from 'routes/missing-node/missing-node.route';

export type AppRouterPanelLayoutProps = {
  /** Panel index within the router panels array. */
  panelKey: number;
};

export const AppRouterPanelLayout = memo(({ panelKey }: AppRouterPanelLayoutProps) => {
  const portal = useAppRouterStore(s => {
    const pageKey = findPageKeyFromPanelKey(s, panelKey);
    const node = findNode(s, { pageKey });
    return node?.portal;
  });

  return !portal ? <MissingNodePage /> : <OutPortal node={portal} />;
});

AppRouterPanelLayout.displayName = 'AppRouterPanelLayout';
