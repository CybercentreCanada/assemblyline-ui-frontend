import BlockIcon from '@mui/icons-material/Block';
import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { ForbiddenPage } from 'routes/forbidden/forbidden';

export const ForbiddenRoute = createAppRoute({
  component: ForbiddenPage,

  path: '/forbidden',

  ancestor: null,
  shortname: () => ['app_route.forbidden.shortname', { ns: 'error403' }],
  fullname: () => ['app_route.forbidden.fullname', { ns: 'error403' }],
  shorticon: () => <BlockIcon />,
  fullicon: () => <BlockIcon />,

  disabled: () => false,
  forbidden: () => false
});

export const DisabledRoute = createAppRoute({
  component: memo(() => <ForbiddenPage disabled />),

  path: '/disabled',

  ancestor: null,
  shortname: () => ['app_route.disabled.shortname', { ns: 'error403' }],
  fullname: () => ['app_route.disabled.fullname', { ns: 'error403' }],
  shorticon: () => <BlockIcon />,
  fullicon: () => <BlockIcon />,

  disabled: () => false,
  forbidden: () => false
});
