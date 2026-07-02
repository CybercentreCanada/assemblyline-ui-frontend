import { findNode, useAppRouterStore } from 'core/router';
import { AppRouteKeyProvider } from 'core/routes';
import { InPortal, OutPortal } from 'features/portal';
import { NotFoundPage } from 'pages/not-found/not-found.route';
import type { PropsWithChildren } from 'react';
import { memo, useMemo } from 'react';
import { Route, Routes } from 'react-router';

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
  appRoutes: AppRoutes;
  /** Key identifying this node in the router store. */
  nodeKey: string;
};

export const AppRouterNode = memo(({ appRoutes, nodeKey }: AppRouterNodeProps) => {
  const routeKey = useAppRouterStore(s => s?.nodes?.[nodeKey]?.routeKey || undefined);
  const portal = useAppRouterStore(s => s?.nodes?.[nodeKey]?.portal || undefined);
  const href = useAppRouterStore(s => s?.routes?.[routeKey]?.href || undefined);
  const state = useAppRouterStore(s => s?.routes?.[routeKey]?.state || undefined);

  const { pathname, search, hash } = useMemo(() => new URL(href, window.location.origin), [href]);

  return !routeKey || !href ? null : (
    <InPortal node={portal}>
      {/* <AppThemeProvider> */}
      <AppRouteKeyProvider routeKey={routeKey}>
        <Routes location={{ pathname, search, hash, state }}>
          {appRoutes.map((route, i) => (
            <Route
              key={i}
              path={route.path}
              element={route.element}
              loader={() => {
                console.log('loader');
              }}
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
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
  appRoutes: AppRoutes;
};

export const AppRouterLayout = memo(({ appRoutes, children }: AppRouterLayoutProps) => {
  const nodeKeys = useAppRouterStore(s => Object.keys(s.nodes));

  return (
    <>
      {children}
      <div style={{ display: 'none' }}>
        {nodeKeys.map(nodeKey => (
          <AppRouterNode key={nodeKey} appRoutes={appRoutes} nodeKey={nodeKey} />
        ))}
      </div>
    </>
  );
});

AppRouterLayout.displayName = 'AppRouterLayout';
