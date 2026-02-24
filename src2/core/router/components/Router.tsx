import React from 'react';
import { RouteIDProvider } from '../providers/RouteIdProvider';
import { useRouterStore } from '../providers/RouterProvider';
import { Link } from './Link';
import { InPortal, OutPortal } from './Portals';
import { Routes } from './Routes';

type PanelViewProps = {
  panelKey: string;
};

const PanelView = React.memo(({ panelKey }: PanelViewProps) => {
  const [panel] = useRouterStore(store => store.panels.find(p => p.id === panelKey));
  const [node] = useRouterStore(store => (panel?.nodeKey ? store.nodes.find(n => n.id === panel.nodeKey) : null));
  const [route] = useRouterStore(store => (node?.routeKey ? store.routes.find(r => r.id === node.routeKey) : null));

  return (
    <div style={{ border: '1px solid grey', minHeight: '220px', padding: '8px' }}>
      <div style={{ marginTop: '8px', opacity: 0.75 }}>panel: {panelKey}</div>
      <div style={{ opacity: 0.75 }}>route: {route?.pathname ?? 'none'}</div>
      {node ? <OutPortal node={node.portal} /> : <div>No node assigned</div>}
    </div>
  );
});

type NodeMountProps = {
  nodeKey: string;
};

const NodeMount = React.memo(({ nodeKey }: NodeMountProps) => {
  const [node] = useRouterStore(store => store.nodes.find(n => n.id === nodeKey));
  const [route] = useRouterStore(store => (node?.routeKey ? store.routes.find(r => r.id === node.routeKey) : null));

  if (!node || !route) return null;

  return (
    <InPortal node={node.portal}>
      <RouteIDProvider routeId={route?.id}>
        <Routes pathname={route?.pathname} search={route?.search} hash={route?.hash} state={route?.state} />
      </RouteIDProvider>
    </InPortal>
  );
});

export const Router = () => {
  const [panels] = useRouterStore(store => store.panels);
  const [nodes] = useRouterStore(store => store.nodes);

  // const panelKeys = useMemo<string[]>(() => Array.from(panels.keys()), []);

  // const nodeKeys = useMemo<string[]>(() => Array.from(nodes.keys()), []);

  return (
    <>
      <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to="/page1">Page 1</Link>
        <Link to="/page2/asdasd">Page 2</Link>
        <Link to="/submissions/asdasd">Submissions</Link>
      </nav>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(panels.length, 1)}, 1fr)`,
          gridGap: '16px',
          height: '50vh'
        }}
      >
        {panels.map(({ id }) => (
          <PanelView key={id} panelKey={id} />
        ))}
      </div>

      <div style={{ display: 'none' }}>
        {nodes.map(({ id }) => (
          <NodeMount key={id} nodeKey={id} />
        ))}
      </div>
    </>
  );
};
