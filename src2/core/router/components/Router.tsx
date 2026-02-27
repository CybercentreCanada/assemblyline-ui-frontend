import React from 'react';
import { Link as RouterLink, useNavigate as useRouterNavigate } from 'react-router';
import { RouteIDProvider } from '../providers/RouteIdProvider';
import { useRouterStore } from '../providers/RouterProvider';
import { closeRouterPanel } from '../utils/router.utils';
import { Link } from './Link';
import { InPortal, OutPortal } from './Portals';
import { Routes } from './Routes';

type PanelViewProps = {
  panelKey: number;
};

const PanelView = React.memo(({ panelKey }: PanelViewProps) => {
  const routerNavigate = useRouterNavigate();

  const [store] = useRouterStore(s => s);
  const [panel] = useRouterStore(store => store.panels?.[panelKey]);
  const [node] = useRouterStore(
    store => Object.entries(store.nodes).find(([, node]) => node?.routeKey === panel?.route)?.[1] ?? null
  );
  const [route] = useRouterStore(store => (node?.routeKey ? store.routes?.[node.routeKey] : null));

  return (
    <div style={{ border: '1px solid grey', minHeight: '220px', padding: '8px' }}>
      <button
        onClick={() => {
          const nextLocation = closeRouterPanel(store, panelKey);

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
      <RouteIDProvider routeKey={node.routeKey}>
        <Routes href={route.href} state={route.state} />
      </RouteIDProvider>
    </InPortal>
  );
});

NodeMount.displayName = 'NodeMount';

export const Router = React.memo(() => {
  const [nbOfPanels] = useRouterStore(s => Math.max(s.panels?.length, 1));
  const [nodeKeys] = useRouterStore(s => Object.keys(s.nodes).toString());

  return (
    <>
      <RouterLink to={{ pathname: '/page1' }} state={{ asdasdasd: 'asdasdasdasdasd' }}>
        link
      </RouterLink>

      <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to="/page1">Page 1</Link>
        <Link to="/page2/asdasd">Page 2</Link>
        <Link to="/submissions/asdasd">Submissions</Link>
      </nav>

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

Router.displayName = 'Router';
