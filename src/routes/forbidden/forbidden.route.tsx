import { createAppRoute } from 'core/routes';
import { ForbiddenPage } from 'routes/forbidden/forbidden';

export const ForbiddenRoute = createAppRoute({
  component: ForbiddenPage,
  path: '/forbidden'
});
