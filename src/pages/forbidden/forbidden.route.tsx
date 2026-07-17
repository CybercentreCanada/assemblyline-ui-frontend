import { createAppRoute } from 'core/routes';
import { ForbiddenPage } from 'pages/forbidden/forbidden';

export const ForbiddenRoute = createAppRoute({
  component: ForbiddenPage,
  route: '/forbidden'
});
