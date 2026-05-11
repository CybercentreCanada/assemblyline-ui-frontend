import { CircularProgress, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { AppVerticalBanner } from 'ui/branding/AppVerticalBanner';
import { PageCardCentered } from 'ui/pages/PageCardCentered';

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
