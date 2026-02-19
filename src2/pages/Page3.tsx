import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';
import { useLocation } from 'react-router';

export const Page3Route = React.memo(() => {
  // const { fileID } = useParams();
  const location = useLocation();

  // console.log(location, fileID);

  return <h1>Page 3{/* <Link to={{}}>test</Link> */}</h1>;
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
