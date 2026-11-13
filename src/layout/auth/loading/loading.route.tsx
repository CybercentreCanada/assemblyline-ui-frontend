import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { createAppRoute } from 'core/router';
import LoadingScreen from 'layout/auth/loading/loading';

export const LoadingRoute = createAppRoute({
  component: <LoadingScreen />,

  path: '/loading',

  ancestor: null,
  shortname: () => ['app_route.loading.shortname', { ns: 'alerts' }],
  fullname: () => ['app_route.loading.fullname', { ns: 'alerts' }],
  shorticon: () => <PendingOutlinedIcon />,
  fullicon: () => <PendingOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
