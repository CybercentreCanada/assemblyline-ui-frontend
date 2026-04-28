import { findNode, useAppRouterStore } from 'core/router';
import { AppRouteKeyProvider, createAppRoute } from 'core/routes';
import { InPortal, OutPortal } from 'features/portal';
import { AppRoutes } from 'layout/routes';
import React, { PropsWithChildren } from 'react';
import { useShallow } from 'zustand/react/shallow';

//*****************************************************************************************
// App Router Panel
//*****************************************************************************************
export type AppRouterPanelProps = {
  panelKey: number;
};

export const AppRouterPanel = React.memo(({ panelKey }: AppRouterPanelProps) => {
  const panel = useAppRouterStore(s => s.panels?.[panelKey]);
  const node = useAppRouterStore(s => findNode(s, { routeKey: panel?.routeKey }));

  return !node ? <div>No node assigned</div> : <OutPortal node={node.portal} />;
});

AppRouterPanel.displayName = 'AppRouterPanel';

//*****************************************************************************************
// App Router Node
//*****************************************************************************************

export type AppRouterNodeProps = {
  nodeKey: string;
  routes: readonly ReturnType<typeof createAppRoute>[];
};

export const AppRouterNode = React.memo(({ nodeKey, routes }: AppRouterNodeProps) => {
  const node = useAppRouterStore(store => store.nodes[nodeKey]);
  const route = useAppRouterStore(store => (node?.routeKey ? store.routes[node.routeKey] : null));

  if (!node || !route) return null;

  return (
    <InPortal node={node.portal}>
      <AppRouteKeyProvider routeKey={node.routeKey}>
        <AppRoutes href={route.href} state={route.state} />
      </AppRouteKeyProvider>
    </InPortal>
  );
});

AppRouterNode.displayName = 'AppRouterNode';

//*****************************************************************************************
// App Router Layout
//*****************************************************************************************

export type AppRouterLayoutProps = PropsWithChildren & {
  routes: readonly ReturnType<typeof createAppRoute>[];
};

export const AppRouterLayout = React.memo(({ children, routes }: AppRouterLayoutProps) => {
  const nodeKeys = useAppRouterStore(useShallow(s => Object.keys(s.nodes)));

  return (
    <>
      {children}
      <div style={{ display: 'none' }}>
        {nodeKeys.map(nodeKey => (
          <AppRouterNode key={nodeKey} nodeKey={nodeKey} routes={routes} />
        ))}
      </div>
    </>
  );
});

AppRouterLayout.displayName = 'AppRouterLayout';
