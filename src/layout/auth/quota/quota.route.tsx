import { createAppRoute } from 'core/router';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import QuotaExceeded from 'core/template/branding/AppVerticalBanner';

export const QuotaRoute = createAppRoute({
  component: <QuotaExceeded />,

  path: '/quota',

  ancestor: null,
  shortname: () => ['app_route.quota.shortname', { ns: 'quota' }],
  fullname: () => ['app_route.quota.fullname', { ns: 'quota' }],
  shorticon: () => <SpeedOutlinedIcon />,
  fullicon: () => <SpeedOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
