import { useNavigate } from 'core/router';
import { Link } from 'core/router/components/Link';
import { useHash } from 'core/router/hooks/useHash';
import { useParams } from 'core/router/hooks/useParams';
import { useSearch } from 'core/router/hooks/useSearch';
import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';
import Page3 from './Submissions';

export type Page2Params = typeof Page2.params;
export type Page2Search = typeof Page2.search;
export type Page2Hash = typeof Page2.hash;

export const Page2Route = React.memo(() => {
  const { fileID } = useParams<typeof Page2>();
  const search = useSearch<typeof Page2>();
  const hash = useHash<typeof Page2>();

  const navigate = useNavigate();

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
        <button onClick={() => navigate({ path: '/page2/:fileID', params: { fileID: 'from-useNavigate' } }, {})}>
          Go to Page 2 (hook)
        </button>
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
