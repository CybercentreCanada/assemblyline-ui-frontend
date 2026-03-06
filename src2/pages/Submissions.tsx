import { useAppPathParams, useAppRouteStore, useAppSearchParams } from 'core/router';
import { createAppRoute } from 'core/router/route/route.utils';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Links } from './Links';

type TestProps = {
  test: string;
};

const Test = React.memo(({ test }: TestProps) => {
  return <div>{test}</div>;
});

export const SubmissionsPage = React.memo(() => {
  // const { fileID } = useParams();

  const query = useAppPathParams('/submissions/:query', s => s.query);

  const offset = useAppSearchParams('/submissions/:query', s => s.get('offset'));

  const [search] = useAppRouteStore(s => s.search.toString());

  // const queryParam = useParams<typeof SubmissionsRoute>()(s => s.query);

  // const search = useSearch<typeof SubmissionsRoute>();

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

      <div>{`query: ${query}`}</div>
      <div>{`offset: ${offset}`}</div>
      <div>{`search: ${search}`}</div>

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
            return [...arr, { test: `${arr.length + 1}` }];
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

export const SubmissionsRoute = createAppRoute({
  component: SubmissionsPage,
  path: '/submissions/:query',
  params: s => ({
    query: s.string()
  }),
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).origin('snapshot').ephemeral(),
    rows: s.number(25).locked().origin('snapshot').ephemeral(),
    sort: s.string('times.submitted desc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(null).origin('snapshot').nullable().ephemeral()
  }),
  hash: hash => hash,

  loading: () => false,

  disabled: () => {
    // const { features } = appStore.getState();
    return false;
  }
});

export default SubmissionsRoute;

//*****************************************************************************************
// to Delete
//*****************************************************************************************

// export const another2 = createPathParamsCodec('/submissions/:query')(p => ({ query: p.string() }));

// another2.type.query = 123;

// const another = createPathParamsCodec('/submit/:test')(p => ({ test: p.string() }));

// const test123: typeof another = null;

// test123.type.test = 123;

// SubmissionsRoute.params.query = 1;

// type Test = (typeof SubmissionsRoute)['path'];

// const test4: Test = null;

// const test: Test = {
//   query: 123
// };

// type Test2 = (typeof SubmissionsRoute)['params']['type'];

// const test2: Test2 = {
//   query: 123
// };
