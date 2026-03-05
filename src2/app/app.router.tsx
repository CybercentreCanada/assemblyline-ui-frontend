import { RouteKeyProvider } from 'core/router/route/route-key.provider';
import { useRouterStore } from 'core/router/router/router.provider';
import { findNode, removePanel, sanitizeRouterStore, storeToNavigate } from 'core/router/router/router.utils';
import { Links } from 'pages/Links';
import React from 'react';
import { Link as RouterLink, useLocation, useNavigate as useRouterNavigate } from 'react-router';
import { AppRoutes } from './app.routes';
import { OutPortal, InPortal } from 'core/portal';

type PanelViewProps = {
  panelKey: number;
};

const PanelView = React.memo(({ panelKey }: PanelViewProps) => {
  const routerNavigate = useRouterNavigate();

  const [store] = useRouterStore(s => s);
  const [panel] = useRouterStore(s => s.panels?.[panelKey]);
  const [node] = useRouterStore(s => findNode(s, { routeKey: panel?.routeKey }));
  const [route] = useRouterStore(s => (node?.routeKey ? s.routes?.[node.routeKey] : null));

  return (
    <div style={{ border: '1px solid grey', minHeight: '220px', padding: '8px' }}>
      <button
        onClick={() => {
          let nextStore = removePanel(store, panelKey);
          nextStore = sanitizeRouterStore(nextStore);
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

type NodeMountProps = {
  nodeKey: string;
};

const NodeMount = React.memo(({ nodeKey }: NodeMountProps) => {
  const [node] = useRouterStore(store => store.nodes[nodeKey]);
  const [route] = useRouterStore(store => (node?.routeKey ? store.routes[node.routeKey] : null));

  if (!node || !route) return null;

  return (
    <InPortal node={node.portal}>
      <RouteKeyProvider routeKey={node.routeKey}>
        <AppRoutes href={route.href} state={route.state} />
      </RouteKeyProvider>
    </InPortal>
  );
});

NodeMount.displayName = 'NodeMount';

export const AppRouter = React.memo(() => {
  const location = useLocation();

  const [store] = useRouterStore(s => s);
  const [nbOfPanels] = useRouterStore(s => Math.max(s.panels?.length, 0));
  const [nodeKeys] = useRouterStore(s => Object.keys(s.nodes).toString());

  return (
    <>
      <RouterLink to={{ pathname: '/page1' }} state={{ asdasdasd: 'asdasdasdasdasd' }}>
        link
      </RouterLink>

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
        {nodeKeys.split(',').map(nodeKey => (
          <NodeMount key={nodeKey} nodeKey={nodeKey} />
        ))}
      </div>
    </>
  );
});

AppRouter.displayName = 'AppRouter';
