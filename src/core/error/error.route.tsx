import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import { createAppRoute } from 'core/routes';
import { memo, useEffect } from 'react';

export type CrashPageProps = {
  message?: string;
};

export const CrashPage = memo(({ message = null }: CrashPageProps) => {
  // This page makes the UI crash so we can test the frontend exception handling
  useEffect(() => {
    throw new Error(message || 'This is a test crash !');
  }, [message]);

  return <div />;
});

export const CrashRoute = createAppRoute({
  component: CrashPage,

  path: '/crash',

  ancestor: null,
  shortname: () => ['app_route.error.shortname', { ns: 'error' }],
  fullname: () => ['app_route.error.fullname', { ns: 'error' }],
  shorticon: () => <BugReportOutlinedIcon />,
  fullicon: () => <BugReportOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
