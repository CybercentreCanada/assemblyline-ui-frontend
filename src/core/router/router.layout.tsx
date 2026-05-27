import { useAppRouterStore } from 'core/router/router.providers';
import { findNode } from 'core/router/router.utils';
import type { createAppRoute } from 'core/routes';
import { AppRouteKeyProvider, AppRoutes } from 'core/routes';
import { InPortal, OutPortal } from 'features/portal';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// App Router Panel
//*****************************************************************************************
export type AppRouterPanelProps = {
  /** Panel index within the router panels array. */
  panelKey: number;
};

export const AppRouterPanel = memo(({ panelKey }: AppRouterPanelProps) => {
  const routeKey = useAppRouterStore(s => s?.panels?.[panelKey]?.routeKey || undefined);
  const portal = useAppRouterStore(s => findNode(s, { routeKey: routeKey })?.portal || undefined);

  return !portal ? <div>No node assigned</div> : <OutPortal node={portal} />;
});

AppRouterPanel.displayName = 'AppRouterPanel';

//*****************************************************************************************
// App Router Node
//*****************************************************************************************

export type AppRouterNodeProps = {
  /** Key identifying this node in the router store. */
  nodeKey: string;
  /** Routes definition array. */
  routes: readonly ReturnType<typeof createAppRoute>[];
};

export const AppRouterNode = memo(({ nodeKey, routes }: AppRouterNodeProps) => {
  const routeKey = useAppRouterStore(s => s?.nodes?.[nodeKey]?.routeKey || undefined);
  const portal = useAppRouterStore(s => s?.nodes?.[nodeKey]?.portal || undefined);
  const href = useAppRouterStore(s => s?.routes?.[routeKey]?.href || undefined);
  const state = useAppRouterStore(s => s?.routes?.[routeKey]?.state || undefined);

  return !routeKey || !href ? null : (
    <InPortal node={portal}>
      {/* <AppThemeProvider> */}
      <AppRouteKeyProvider routeKey={routeKey}>
        <AppRoutes href={href} state={state} />
      </AppRouteKeyProvider>
      {/* </AppThemeProvider> */}
    </InPortal>
  );
});

AppRouterNode.displayName = 'AppRouterNode';

//*****************************************************************************************
// App Router Layout
//*****************************************************************************************

export type AppRouterLayoutProps = PropsWithChildren & {
  /** Routes definition array. */
  routes: readonly ReturnType<typeof createAppRoute>[];
};

export const AppRouterLayout = memo(({ children, routes }: AppRouterLayoutProps) => {
  const nodeKeys = useAppRouterStore(s => Object.keys(s.nodes));

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
