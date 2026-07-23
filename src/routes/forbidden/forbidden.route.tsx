import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { ForbiddenPage } from 'routes/forbidden/forbidden';

export const ForbiddenRoute = createAppRoute({
  component: ForbiddenPage,
  path: '/forbidden'
});

export const DisabledRoute = createAppRoute({
  component: memo(() => <ForbiddenPage disabled />),
  path: '/disabled'
});
