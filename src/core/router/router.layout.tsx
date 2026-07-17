import { findNode, findRouteKeyFromPanelKey, useAppRouterStore } from 'core/router';
import {
  AppRouteKeyProvider,
  AppRouteLayoutProvider,
  findRouteSpecFromKey,
  useAppLocationParamStore
} from 'core/routes';
import { InPortal, OutPortal } from 'features/portal';
import { MissingNodePage } from 'pages/missing-node/missing-node.route';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// App Router Route
//*****************************************************************************************

export type AppRouterRouteLayoutProps = {
  /** Key identifying this node in the router store. */
  routeKey: string;
};

export const AppRouterRouteLayout = memo(({ routeKey }: AppRouterRouteLayoutProps) => {
  const element = useAppLocationParamStore(s => findRouteSpecFromKey(s, routeKey)?.element);

  return !routeKey || !element ? null : (
    <AppRouteLayoutProvider routeKey={routeKey}>
      {/* <Activity mode={visible ? 'visible' : 'hidden'}> */}
      <AppRouteKeyProvider routeKey={routeKey}>{element}</AppRouteKeyProvider>
      {/* </Activity> */}
    </AppRouteLayoutProvider>
  );
});

AppRouterRouteLayout.displayName = 'AppRouterRouteLayout';

//*****************************************************************************************
// App Router Node
//*****************************************************************************************

export type AppRouterNodeLayoutProps = {
  /** Key identifying this node in the router store. */
  nodeKey: string;
};

export const AppRouterNodeLayout = memo(({ nodeKey }: AppRouterNodeLayoutProps) => {
  const routeKey = useAppRouterStore(s => s?.nodes?.[nodeKey]?.routeKey || undefined);
  const portal = useAppRouterStore(s => s?.nodes?.[nodeKey]?.portal || undefined);

  return !routeKey ? null : (
    <InPortal node={portal}>
      <AppRouterRouteLayout routeKey={routeKey} />
    </InPortal>
  );
});

AppRouterNodeLayout.displayName = 'AppRouterNodeLayout';

//*****************************************************************************************
// App Router Panel
//*****************************************************************************************
export type AppRouterPanelLayoutProps = {
  /** Panel index within the router panels array. */
  panelKey: number;
};

export const AppRouterPanelLayout = memo(({ panelKey }: AppRouterPanelLayoutProps) => {
  const portal = useAppRouterStore(s => {
    const routeKey = findRouteKeyFromPanelKey(s, panelKey);
    const node = findNode(s, { routeKey });
    return node?.portal;
  });

  return !portal ? <MissingNodePage /> : <OutPortal node={portal} />;
});

AppRouterPanelLayout.displayName = 'AppRouterPanelLayout';

//*****************************************************************************************
// App Router Layout
//*****************************************************************************************

export const AppRouterLayout = memo(({ children }: PropsWithChildren) => {
  const nodeKeys = useAppRouterStore(s => Object.keys(s?.nodes || {}));

  return (
    <>
      {children}
      <div style={{ display: 'none' }}>
        {nodeKeys.map(nodeKey => (
          <AppRouterNodeLayout key={nodeKey} nodeKey={nodeKey} />
        ))}
      </div>
    </>
  );
});

AppRouterLayout.displayName = 'AppRouterLayout';
