import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import BlockIcon from '@mui/icons-material/Block';

export const ForbiddenRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'forbidden'
  },
  icon: {
    primary: <BlockIcon />
  },
  ancestor: null,
  component: ForbiddenPage,
  path: '/forbidden'
});

export const DisabledRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'forbidden'
  },
  icon: {
    primary: <BlockIcon />
  },
  ancestor: null,
  component: memo(() => <ForbiddenPage disabled />),
  path: '/disabled'
});
