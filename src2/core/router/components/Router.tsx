import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router';
import { RouteIDProvider } from '../providers/RouteIdProvider';
import { useRouterStore } from '../providers/RouterProvider';
import { Link } from './Link';
import { InPortal, OutPortal } from './Portals';
import { Routes } from './Routes';

type PanelViewProps = {
  panelKey: string;
};

const PanelView = React.memo(({ panelKey }: PanelViewProps) => {
  const [panel] = useRouterStore(store => store.panels.entries[panelKey]);
  const [node] = useRouterStore(store => (panel?.nodeKey ? store.nodes.entries[panel.nodeKey] : null));
  const [route] = useRouterStore(store => (node?.routeKey ? store.routes.entries[node.routeKey] : null));

  return (
    <div style={{ border: '1px solid grey', minHeight: '220px', padding: '8px' }}>
      <div style={{ marginTop: '8px', opacity: 0.75 }}>panel: {panelKey}</div>
      <div style={{ opacity: 0.75 }}>route: {route?.href ?? 'none'}</div>
      {node ? <OutPortal node={node.portal} /> : <div>No node assigned</div>}
    </div>
  );
});

type NodeMountProps = {
  nodeKey: string;
};

const NodeMount = React.memo(({ nodeKey }: NodeMountProps) => {
  const [node] = useRouterStore(store => store.nodes.entries[nodeKey]);
  const [route] = useRouterStore(store => (node?.routeKey ? store.routes.entries[node.routeKey] : null));

  if (!node || !route) return null;

  return (
    <InPortal node={node.portal}>
      <RouteIDProvider routeId={node.routeKey}>
        <Routes href={route.href} state={route.state} />
      </RouteIDProvider>
    </InPortal>
  );
});

export const Router = () => {
  const [store, setRouterStore] = useRouterStore(s => s);
  const [panels] = useRouterStore(s => s.panels);
  const [nodes] = useRouterStore(s => s.nodes);

  useEffect(() => {
    function handleResize() {
      // TODO
      console.log('TODO: Resize');
      setRouterStore(s => s);
    }

    document.addEventListener('resize', handleResize);
    handleResize();
    return () => document.removeEventListener('resize', handleResize);
  }, []);

  console.log(store);

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
          gridTemplateColumns: `repeat(${Math.max(panels.keys.length, 1)}, 1fr)`,
          gridGap: '16px',
          height: '50vh'
        }}
      >
        {panels.keys.map(panelKey => (
          <PanelView key={panelKey} panelKey={panelKey} />
        ))}
      </div>

      <div style={{ display: 'none' }}>
        {nodes.keys.map(nodeKey => (
          <NodeMount key={nodeKey} nodeKey={nodeKey} />
        ))}
      </div>
    </>
  );
};
