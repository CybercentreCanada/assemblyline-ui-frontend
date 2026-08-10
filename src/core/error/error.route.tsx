import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import { ErrorFallback } from 'core/error/error.components';
import { createAppRoute } from 'core/routes';

export const CrashRoute = createAppRoute({
  component: ErrorFallback,

  path: '/crash',

  ancestor: null,
  shortname: () => ({ i18nKey: 'error.crash', ns: 'error' }),
  fullname: () => ({ i18nKey: 'error.crash', ns: 'error' }),
  shorticon: () => <BugReportOutlinedIcon />,
  fullicon: () => <BugReportOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
