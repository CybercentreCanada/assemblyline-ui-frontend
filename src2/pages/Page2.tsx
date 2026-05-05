import { createAppRoute } from 'core/routes';
import { memo, useEffect, useState } from 'react';
import { Links } from './Links';

export type Page2Params = typeof Page2Route.params;
export type Page2Search = typeof Page2Route.search;
export type Page2Hash = typeof Page2Route.hash;

export const Page2Page = memo(() => {
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

export const Page2Route = createAppRoute({
  component: Page2Page,
  path: '/page2/:fileID',
  params: p => ({ fileID: p.string() })
});
