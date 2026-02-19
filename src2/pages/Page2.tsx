import { Link } from 'core/router/components/Link';
import { useHash } from 'core/router/hooks/useHash';
import { useSearch } from 'core/router/hooks/useSearch';
import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';
import { useLocation, useParams } from 'react-router';
import Page3 from './Page3';

export type Page2Params = typeof Page2.params;
export type Page2Search = typeof Page2.search;
export type Page2Hash = typeof Page2.hash;

export const Page2Route = React.memo(() => {
  const { fileID } = useParams<Page2Params>();
  const search = useSearch<Page2Search>();
  const hash = useHash<Page2Hash>();
  const location = useLocation();
  void search;
  void hash;

  console.log(location, fileID);

  return (
    <div>
      <h1>Page 2</h1>
      <Link to={Page2} params={{ fileID: 'asd' }}>
        Current route param: {fileID}
      </Link>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/page1">Go to Page 1</Link>
        <Link to={Page3}>Go to Page 3</Link>
        <Link to="/page1" panel="drawer">
          Open Page 1 (drawer)
        </Link>
        <Link to={Page3} panel="drawer">
          Open Page 3 (drawer)
        </Link>
      </div>
    </div>
  );
});

export const Page2 = createRoute({ path: '/page2/:fileID', component: Page2Route });

export default Page2;
