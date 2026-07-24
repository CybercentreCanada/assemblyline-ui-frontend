import { createAppRoute } from 'core/routes';
import { NotFoundPage } from 'routes/not-found/not-found';
import LinkOffIcon from '@mui/icons-material/LinkOff';

//*****************************************************************************************
// NotFound Route
//*****************************************************************************************

export const NotFoundRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'notfound'
  },
  icon: {
    primary: <LinkOffIcon />
  },
  ancestor: null,
  component: NotFoundPage,
  path: '/not-found',
  search: s => ({
    values: s.object(null).source('transient').ephemeral().ignored().nullable()
  })
});
