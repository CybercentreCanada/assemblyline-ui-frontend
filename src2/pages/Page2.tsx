import { Link } from 'core/router/components/Link';
import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';

export type Page2Params = typeof Page2.params;
export type Page2Search = typeof Page2.search;
export type Page2Hash = typeof Page2.hash;

export const Page2Route = React.memo(() => {
  // const { fileID } = useParams<typeof Page2>();
  // const search = useSearch<typeof Page2>();
  // const hash = useHash<typeof Page2>();

  // const navigate = useNavigate();

  // console.log(location, fileID);

  return (
    <div>
      <h1>Page 2</h1>
      {/* <Link to={Page2} params={{ fileID: 'asd' }}>
        Current route param: {fileID}
      </Link> */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/page1">Page 1</Link>
        <Link to="/page2/asdasd">Page 2</Link>
        <Link to="/submissions/asdasd">Submissions</Link>
        {/* <Link to={SubmissionsRoute}>Go to Submission</Link> */}
        {/* <button onClick={() => navigate({ path: '/page2/:fileID', params: { fileID: 'from-useNavigate' } }, {})}>
          Go to Page 2 (hook)
        </button>
        <Link to="/page1" panel={2}>
          Open Page 1 (drawer)
        </Link>
        <Link to={Page3} panel={2}>
          Open Page 3 (drawer)
        </Link> */}
      </div>
    </div>
  );
});

export const Page2 = createRoute({ path: '/page2/:fileID', component: Page2Route });

export default Page2;

Page2Route.displayName = 'Page2Route';
