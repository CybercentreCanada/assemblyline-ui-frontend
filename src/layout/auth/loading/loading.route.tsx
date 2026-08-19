import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { CircularProgress, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { AppPageCardCentered, AppVerticalBanner } from 'core/template';
import { memo } from 'react';

//*****************************************************************************************
// Loading Page
//*****************************************************************************************
export type LoadingPageProps = {
  hideBanner?: boolean;
};

export const LoadingPage = memo(({ hideBanner = false }: LoadingPageProps) => {
  const theme = useTheme();

  return hideBanner ? (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <CircularProgress variant="indeterminate" />
    </div>
  ) : (
    <AppPageCardCentered
      sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(3), alignItems: 'center' }}
    >
      <AppVerticalBanner />
      <CircularProgress variant="indeterminate" />
    </AppPageCardCentered>
  );
});

LoadingPage.displayName = 'LoadingPage';

//*****************************************************************************************
// Loading Route
//*****************************************************************************************

export const LoadingRoute = createAppRoute({
  component: LoadingPage,

  path: '/loading',

  ancestor: null,
  shortname: () => ['app_route.loading.shortname', { ns: 'alerts' }],
  fullname: () => ['app_route.loading.fullname', { ns: 'alerts' }],
  shorticon: () => <PendingOutlinedIcon />,
  fullicon: () => <PendingOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
