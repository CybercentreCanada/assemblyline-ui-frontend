import { CircularProgress } from '@mui/material';
import { useAppBannerVert } from 'core/preference/preference.hooks';
import { PageCardCentered } from 'layout/page/PageCardCentered';
import React from 'react';

export type LoadingScreenProps = {
  hideBanner?: boolean;
};

export const LoadingScreen = React.memo(({ hideBanner = false }: LoadingScreenProps) => {
  const Banner = useAppBannerVert();

  return hideBanner ? (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <CircularProgress variant="indeterminate" />
    </div>
  ) : (
    <PageCardCentered sx={{ textAlign: 'center' }}>
      <Banner />
      <CircularProgress variant="indeterminate" />
    </PageCardCentered>
  );
});
