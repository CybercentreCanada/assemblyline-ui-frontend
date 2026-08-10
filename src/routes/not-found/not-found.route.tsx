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
  shortname: () => ({ i18nKey: 'notfound', ns: 'app' }),
  fullname: () => ({ i18nKey: 'notfound', ns: 'app' }),
  shorticon: () => <LinkOffIcon />,
  fullicon: () => <LinkOffIcon />,

  disabled: () => false,
  forbidden: () => false
});
