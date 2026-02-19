import { useLocation } from 'react-router';
import { Link } from './Link';
import { RouteProvider } from '../providers/RouteProvider';
import { RouterProvider } from '../providers/RouterProvider';
import { Routes } from './Routes';
import Page2 from 'pages/Page2';
import Page3 from 'pages/Page3';

export const Router = () => {
  const location = useLocation();

  return (
    <RouterProvider>
      <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to="/page1">Page 1</Link>
        <Link to={Page2} params={{ fileID: 'router-nav' }}>
          Page 2
        </Link>
        <Link to={Page3}>Page 3</Link>
        <span style={{ marginLeft: '8px' }}>|</span>
        <Link to="/page1" panel="drawer">
          Open Page 1 (drawer)
        </Link>
        <Link to={Page2} params={{ fileID: 'drawer-nav' }} panel="drawer">
          Open Page 2 (drawer)
        </Link>
        <Link to={Page3} panel="drawer">
          Open Page 3 (drawer)
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '16px', height: '50vh' }}>
        <div style={{ border: '1px solid grey' }}>
          <RouteProvider panel="main">
            <Routes location={location.pathname} />
          </RouteProvider>
        </div>
        <div style={{ border: '1px solid grey' }}>
          <RouteProvider panel="drawer">
            <Routes location={location.hash.slice(1)} />
          </RouteProvider>
        </div>
      </div>
    </RouterProvider>
  );
};
