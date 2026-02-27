import { useNavigate, useParams, useSearch } from 'core/router';
import { createRoute } from 'core/router/utils/createRoute';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Links } from './Links';

type TestProps = {
  test: string;
};

const Test = React.memo(({ test }: TestProps) => {
  return <div>{test}</div>;
});

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

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const [array, setArray] = useState([
    { test: '1' },
    { test: '2' },
    { test: '3' },
    { test: '4' },
    { test: '5' },
    { test: '6' }
  ]);

  return loading ? (
    <div>loading</div>
  ) : (
    <div>
      <Links />
      <h1>Submissions</h1>

      <button
        onClick={() => {
          setArray(arr => {
            return [arr[array.length - 1], ...arr.toSpliced(array.length - 1, 1)];
          });
        }}
      >
        shift
      </button>

      <button
        onClick={() => {
          setArray(arr => {
            return [...arr, { test: `${arr.length}` }];
          });
        }}
      >
        add
      </button>

      {array.map(a => (
        <Test key={a.test} test={a.test} />
      ))}
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
