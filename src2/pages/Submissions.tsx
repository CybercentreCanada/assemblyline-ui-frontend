import { useNavigate, useParams, useSearch } from 'core/router';
import { Link } from 'core/router/components/Link';
import { createRoute } from 'core/router/utils/createRoute';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router';
import Page2 from './Page2';

export const SubmissionsPage = React.memo(() => {
  // const { fileID } = useParams();
  const location = useLocation();

  const { query } = useParams<typeof SubmissionsRoute>();

  const search = useSearch<typeof SubmissionsRoute>();

  const navigate = useNavigate();

  const callback = useCallback(() => {
    navigate({
      path: '/submissions/:query',
      params: { query: '123' },
      search: { query: '123' }

      // search: { query: 123, offset: '123' }
    });
  }, []);

  return (
    <div>
      <h1>Submissions</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/page1">Go to Page 1</Link>
        <Link to={Page2} params={{ fileID: 'from-page3' }}>
          Go to Page 2
        </Link>
        {/* <Link to="/page1" panel={2}>
          Open Page 1 (drawer)
        </Link>
        <Link to={Page2} params={{ fileID: 'from-page3-drawer' }} panel={2}>
          Open Page 2 (drawer)
        </Link> */}
      </div>
    </div>
  );
});

export const SubmissionsRoute = createRoute({
  path: '/submissions/:query',
  params: p => ({
    query: p.string()
  }),
  search: p => ({
    query: p.string(''),
    offset: p.number(0).min(0).origin('snapshot').ephemeral(),
    rows: p.number(25).locked().origin('snapshot').ephemeral(),
    sort: p.string('times.submitted desc').ephemeral(),
    filters: p.filters([]),
    track_total_hits: p.number(null).origin('snapshot').nullable().ephemeral()
  }),

  component: SubmissionsPage,

  disabled: () => {
    // const { features } = appStore.getState();
    return false;
  }
});

SubmissionsRoute.search;

export default SubmissionsRoute;
