import { createRoute } from 'core/router/utils/createRoute';
import React, { useEffect, useState } from 'react';
import { Links } from './Links';

export type Page2Params = typeof Page2Route.params;
export type Page2Search = typeof Page2Route.search;
export type Page2Hash = typeof Page2Route.hash;

export const Page2Page = React.memo(() => {
  // const { fileID } = useParams<typeof Page2>();
  // const search = useSearch<typeof Page2>();
  // const hash = useHash<typeof Page2>();

  // const navigate = useNavigate();

  // console.log(location, fileID);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return loading ? (
    <div>loading</div>
  ) : (
    <div>
      <Links />
      <h1>Page 2</h1>
    </div>
  );
});

Page2Page.displayName = 'Page2Page';

export const Page2Route = createRoute({
  component: Page2Page,
  path: '/page2/:fileID',
  params: p => ({ fileID: p.string() })
});

export default Page2Route;
