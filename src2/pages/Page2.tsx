import { Link } from 'core/router/components/Link';
import { useHash } from 'core/router/hooks/useHash';
import { useSearch } from 'core/router/hooks/useSearch';
import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';
import { useLocation, useParams } from 'react-router';

export type Page2Params = typeof Page2.params;
export type Page2Search = typeof Page2.search;
export type Page2Hash = typeof Page2.hash;

export const Page2Route = React.memo(() => {
  const { fileID } = useParams<Page2Params>();
  const search = useSearch<Page2Search>();
  const hash = useHash<Page2Hash>();
  const location = useLocation();

  console.log(location, fileID);

  return (
    <div>
      <h1>Page 2</h1>
      <Link to={Page2} params={{ fileID: 'asd' }}>
        {fileID}
      </Link>
    </div>
  );
});

export const Page2 = createRoute({ path: '/page2/:fileID', component: Page2Route });

export default Page2;
