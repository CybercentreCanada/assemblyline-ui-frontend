import { CircularProgress, useTheme } from '@mui/material';
import { useAppBannerVert } from 'core/preference/preference.hooks';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { PageCardCentered } from 'ui/layouts/PageCardCentered';

//*****************************************************************************************
// Loading Page
//*****************************************************************************************
export type LoadingPageProps = {
  hideBanner?: boolean;
};

export const LoadingPage = React.memo(({ hideBanner = false }: LoadingPageProps) => {
  const theme = useTheme();
  const Banner = useAppBannerVert();

  return hideBanner ? (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <CircularProgress variant="indeterminate" />
    </div>
  ) : (
    <PageCardCentered sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(3), textAlign: 'center' }}>
      <Banner />
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
