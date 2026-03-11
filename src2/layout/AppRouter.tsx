import { AppRouteKeyProvider, useAppRouterStore } from 'core/router';
import { AppRoutes } from 'core/router/route/route.components';
import { findNode, removePanel, storeToNavigate, sanitizeAppRouterStore } from 'core/router/router/router.utils';
import { InPortal, OutPortal } from 'features/portal';
import { Links } from 'pages/Links';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

//*****************************************************************************************
// Panel View
//*****************************************************************************************
type PanelViewProps = {
  panelKey: number;
};

const PanelView = React.memo(({ panelKey }: PanelViewProps) => {
  const routerNavigate = useNavigate();

  const store = useAppRouterStore(s => s);
  const panel = useAppRouterStore(s => s.panels?.[panelKey]);
  const node = useAppRouterStore(s => findNode(s, { routeKey: panel?.routeKey }));
  const route = useAppRouterStore(s => (node?.routeKey ? s.routes?.[node.routeKey] : null));

  return (
    <div style={{ border: '1px solid grey', minHeight: '220px', padding: '8px' }}>
      <button
        onClick={() => {
          let nextStore = removePanel(store, panelKey);
          nextStore = sanitizeAppRouterStore(nextStore);
          const nextLocation = storeToNavigate(nextStore);
          if (nextLocation) {
            routerNavigate(nextLocation.to, nextLocation.options);
          }
        }}
      >
        X
      </button>
      <div style={{ marginTop: '8px', opacity: 0.75 }}>panel: {panelKey}</div>
      <div style={{ opacity: 0.75 }}>route: {route?.href ?? 'none'}</div>
      {node ? <OutPortal node={node.portal} /> : <div>No node assigned</div>}
    </div>
  );
});

PanelView.displayName = 'PanelView';

//*****************************************************************************************
// Node Mount
//*****************************************************************************************

type NodeMountProps = {
  nodeKey: string;
};

const NodeMount = React.memo(({ nodeKey }: NodeMountProps) => {
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

NodeMount.displayName = 'NodeMount';

//*****************************************************************************************
// App Router
//*****************************************************************************************

export const AppRouter = React.memo(() => {
  const store = useAppRouterStore(s => s);
  const nbOfPanels = useAppRouterStore(s => Math.max(s.panels?.length, 0));
  const nodeKeys = useAppRouterStore(useShallow(s => Object.keys(s.nodes)));

  return (
    <>
      <Link to={{ pathname: '/page1' }} state={{ asdasdasd: 'asdasdasdasdasd' }}>
        link
      </Link>

      <Links />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${nbOfPanels}, 1fr)`,
          gridGap: '16px',
          height: '50vh'
        }}
      >
        {Array.from({ length: nbOfPanels }).map((panel, panelKey) => (
          <PanelView key={panelKey} panelKey={panelKey} />
        ))}
      </div>

      <div style={{ display: 'none' }}>
        {nodeKeys.map(nodeKey => (
          <NodeMount key={nodeKey} nodeKey={nodeKey} />
        ))}
      </div>
    </>
  );
});

AppRouter.displayName = 'AppRouter';
