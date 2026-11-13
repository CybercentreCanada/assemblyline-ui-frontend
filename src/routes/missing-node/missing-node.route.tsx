import LinkOffIcon from '@mui/icons-material/LinkOff';
import { createAppRoute } from 'core/router';
import { MissingNodePage } from 'routes/missing-node/missing-node.page';

//*****************************************************************************************
// Missing Node Route
//*****************************************************************************************

export const MissingNodeRoute = createAppRoute({
  component: MissingNodePage,

  path: '/missing-node',

  ancestor: null,
  shortname: () => ['app_route.missing_node.shortname', { ns: 'missingNode' }],
  fullname: () => ['app_route.missing_node.fullname', { ns: 'missingNode' }],
  shorticon: () => <LinkOffIcon />,
  fullicon: () => <LinkOffIcon />,

  disabled: () => false,
  forbidden: () => false
});
