import { createRoute } from 'core/router/utils/createRoute';
import { Page3 } from './Page3';

export const Page3Route = createRoute({
  path: '/page2/:fileID',
  component: Page3,
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
