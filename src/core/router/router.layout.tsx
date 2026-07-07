import { findNode, useAppRouterStore } from 'core/router';
import { AppRouteKeyProvider, findRouteDefinitionFromKey, useAppLocationStore } from 'core/routes';
import { InPortal, OutPortal } from 'features/portal';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// App Router Route
//*****************************************************************************************

export type AppRouterRouteProps = {
  /** Key identifying this node in the router store. */
  routeKey: string;
};

export const AppRouterRoute = memo(({ routeKey }: AppRouterRouteProps) => {
  const element = useAppLocationStore(s => findRouteDefinitionFromKey(s, routeKey)?.element);
  return !routeKey || !element ? null : <AppRouteKeyProvider routeKey={routeKey}>{element}</AppRouteKeyProvider>;
});

AppRouterRoute.displayName = 'AppRouterRoute';

//*****************************************************************************************
// App Router Node
//*****************************************************************************************

export type AppRouterNodeProps = {
  /** Key identifying this node in the router store. */
  nodeKey: string;
};

export const AppRouterNode = memo(({ nodeKey }: AppRouterNodeProps) => {
  const routeKey = useAppRouterStore(s => s?.nodes?.[nodeKey]?.routeKey || undefined);
  const portal = useAppRouterStore(s => s?.nodes?.[nodeKey]?.portal || undefined);

  return !routeKey ? null : (
    <InPortal node={portal}>
      <AppRouterRoute routeKey={routeKey} />
    </InPortal>
  );
});

AppRouterNode.displayName = 'AppRouterNode';

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
// App Router Layout
//*****************************************************************************************

export const AppRouterLayout = memo(({ children }: PropsWithChildren) => {
  const nodeKeys = useAppRouterStore(s => Object.keys(s?.nodes || {}));

  return (
    <>
      {children}
      <div style={{ display: 'none' }}>
        {nodeKeys.map(nodeKey => (
          <AppRouterNode key={nodeKey} nodeKey={nodeKey} />
        ))}
      </div>
    </>
  );
});

AppRouterLayout.displayName = 'AppRouterLayout';
