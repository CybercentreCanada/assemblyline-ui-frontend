import { createAppRoute } from 'core/routes';
import { NotFoundPage } from 'pages/not-found/not-found';

//*****************************************************************************************
// NotFound Route
//*****************************************************************************************

export const NotFoundRoute = createAppRoute({
  component: NotFoundPage,
  route: '/not-found'
});
