import { findNode, findPageKeyFromPanelKey, useAppRouterStore } from 'core/router';
import { AppPageKeyProvider, AppRouteLayoutProvider, findAppRouteFromKey, useAppLocationParamStore } from 'core/routes';
import { InPortal, OutPortal } from 'features/portal';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { MissingNodePage } from 'routes/missing-node/missing-node.route';

//*****************************************************************************************
// App Router Page
//*****************************************************************************************

export type AppRouterPageLayoutProps = {
  /** Key identifying this node in the router store. */
  pageKey: string;
};

export const AppRouterPageLayout = memo(({ pageKey }: AppRouterPageLayoutProps) => {
  const element = useAppLocationParamStore(s => findAppRouteFromKey(s, pageKey)?.element);

  return !pageKey || !element ? null : (
    <AppPageKeyProvider pageKey={pageKey}>
      <AppRouteLayoutProvider pageKey={pageKey}>
        {/* <Activity mode={visible ? 'visible' : 'hidden'}> */}
        {element}
        {/* </Activity> */}
      </AppRouteLayoutProvider>
    </AppPageKeyProvider>
  );
});

AppRouterPageLayout.displayName = 'AppRouterPageLayout';

//*****************************************************************************************
// App Router Node
//*****************************************************************************************

export type AppRouterNodeLayoutProps = {
  /** Key identifying this node in the router store. */
  nodeKey: string;
};

export const AppRouterNodeLayout = memo(({ nodeKey }: AppRouterNodeLayoutProps) => {
  const pageKey = useAppRouterStore(s => s?.nodes?.[nodeKey]?.pageKey || undefined);
  const portal = useAppRouterStore(s => s?.nodes?.[nodeKey]?.portal || undefined);

  return !pageKey ? null : (
    <InPortal node={portal}>
      <AppRouterPageLayout pageKey={pageKey} />
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
    const pageKey = findPageKeyFromPanelKey(s, panelKey);
    const node = findNode(s, { pageKey });
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
