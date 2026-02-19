import { Link } from 'core/router/components/Link';
import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';
import { useLocation } from 'react-router';
import Page2 from './Page2';

export const Page3Route = React.memo(() => {
  // const { fileID } = useParams();
  const location = useLocation();

  return (
    <div>
      <h1>Page 3</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/page1">Go to Page 1</Link>
        <Link to={Page2} params={{ fileID: 'from-page3' }}>
          Go to Page 2
        </Link>
        <Link to="/page1" panel="drawer">
          Open Page 1 (drawer)
        </Link>
        <Link to={Page2} params={{ fileID: 'from-page3-drawer' }} panel="drawer">
          Open Page 2 (drawer)
        </Link>
      </div>
    </div>
  );
});

export const Page3 = createRoute({
  path: '/page3',
  component: Page3Route,
  search: p => ({
    query: p.string(''),
    offset: p.number(0).min(0).origin('snapshot').ephemeral(),
    rows: p.number(25).locked().origin('snapshot').ephemeral(),
    sort: p.string('times.submitted desc').ephemeral(),
    filters: p.filters([]),
    track_total_hits: p.number(null).origin('snapshot').nullable().ephemeral()
  })

  // disabled: () => {
  //   const { features } = appStore.getState();
  //   return false;
  // }
});

export default Page3;
