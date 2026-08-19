import { createAppRoute } from 'core/routes';
import { NotFoundPage } from 'routes/not-found/not-found';
import LinkOffIcon from '@mui/icons-material/LinkOff';

//*****************************************************************************************
// NotFound Route
//*****************************************************************************************

export const NotFoundRoute = createAppRoute({
  component: NotFoundPage,

  path: '/not-found',
  search: s => ({
    values: s.object(null).source('transient').ephemeral().ignored().nullable()
  }),

  ancestor: null,
  shortname: () => ['app_route.not_found.shortname', { ns: 'error404' }],
  fullname: () => ['app_route.not_found.fullname', { ns: 'error404' }],
  shorticon: () => <LinkOffIcon />,
  fullicon: () => <LinkOffIcon />,

  disabled: () => false,
  forbidden: () => false
});
