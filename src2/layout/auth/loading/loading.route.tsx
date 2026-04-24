import { CircularProgress, useTheme } from '@mui/material';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { AppVerticalBanner } from 'ui/branding';
import { PageCardCentered } from 'ui/pages';

//*****************************************************************************************
// Loading Page
//*****************************************************************************************
export type LoadingPageProps = {
  hideBanner?: boolean;
};

export const LoadingPage = React.memo(({ hideBanner = false }: LoadingPageProps) => {
  const theme = useTheme();

  return hideBanner ? (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <CircularProgress variant="indeterminate" />
    </div>
  ) : (
    <PageCardCentered sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(3), alignItems: 'center' }}>
      <AppVerticalBanner />
      <CircularProgress variant="indeterminate" />
    </PageCardCentered>
  );
});

LoadingPage.displayName = 'LoadingPage';

//*****************************************************************************************
// Loading Route
//*****************************************************************************************

export const LoadingRoute = createAppRoute({
  component: LoadingPage,
  path: '/loading'
});

export default LoadingRoute;
