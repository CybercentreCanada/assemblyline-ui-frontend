import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import BlockIcon from '@mui/icons-material/Block';

export const ForbiddenRoute = createAppRoute({
  component: ForbiddenPage,

  path: '/forbidden',

  ancestor: null,
  shortname: () => ({ i18nKey: 'forbidden', ns: 'app' }),
  fullname: () => ({ i18nKey: 'forbidden', ns: 'app' }),
  shorticon: () => <BlockIcon />,
  fullicon: () => <BlockIcon />,

  disabled: () => false,
  forbidden: () => false
});

export const DisabledRoute = createAppRoute({
  component: memo(() => <ForbiddenPage disabled />),

  path: '/disabled',

  ancestor: null,
  shortname: () => ({ i18nKey: 'forbidden', ns: 'app' }),
  fullname: () => ({ i18nKey: 'forbidden', ns: 'app' }),
  shorticon: () => <BlockIcon />,
  fullicon: () => <BlockIcon />,

  disabled: () => false,
  forbidden: () => false
});
