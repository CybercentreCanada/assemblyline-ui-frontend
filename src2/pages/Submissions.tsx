import { useNavigate, useParams, useSearch } from 'core/router';
import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';
import { useLocation } from 'react-router';
import { Links } from './Links';

export const SubmissionsPage = React.memo(() => {
  // const { fileID } = useParams();
  const location = useLocation();

  const { query } = useParams<typeof SubmissionsRoute>();

  const search = useSearch<typeof SubmissionsRoute>();

  const navigate = useNavigate();

  // const callback = useCallback(() => {
  //   navigate({
  //     path: '/submissions/:query',
  //     params: { query: '123' },
  //     search: { query: '123' },
  //     target: ['open', 'replace']
  //   });
  // }, []);

  return (
    <div>
      <Links />
      <h1>Submissions</h1>
    </div>
  );
});

SubmissionsPage.displayName = 'SubmissionsPage';

export const SubmissionsRoute = createRoute({
  component: SubmissionsPage,
  path: '/submissions/:query',
  loading: () => false,

  disabled: () => {
    // const { features } = appStore.getState();
    return false;
  },

  paramParser: p => ({
    query: p.string()
  }),
  searchParser: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).origin('snapshot').ephemeral(),
    rows: s.number(25).locked().origin('snapshot').ephemeral(),
    sort: s.string('times.submitted desc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(null).origin('snapshot').nullable().ephemeral()
  }),
  hashParser: h => ({})
});

export default SubmissionsRoute;
