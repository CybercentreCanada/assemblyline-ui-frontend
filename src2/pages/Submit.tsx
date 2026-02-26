import { createRoute } from 'core/router/utils/createRoute';
import React from 'react';
import { Links } from './Links';

export type SubmitParams = typeof SubmitRoute.params;
export type SubmitSearch = typeof SubmitRoute.search;
export type SubmitHash = typeof SubmitRoute.hash;

export const SubmitPage = React.memo(() => {
  // const { fileID } = useParams<typeof Submit>();
  // const search = useSearch<typeof Submit>();
  // const hash = useHash<typeof Submit>();

  // const navigate = useNavigate();

  // console.log(location, fileID);

  return (
    <div>
      <Links />
      <h1>Submit</h1>
    </div>
  );
});

SubmitPage.displayName = 'SubmitPage';

export const SubmitRoute = createRoute({ path: '/submit', component: SubmitPage });

export default SubmitRoute;
