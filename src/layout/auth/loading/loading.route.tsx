import { CircularProgress } from '@mui/material';
import { useAppBannerVert } from 'core/template/components/app/hooks';
import { memo } from 'react';

export type LoadingPageProps = {
  showImage?: boolean;
};

export const LoadingPage = memo(({ showImage = true }: LoadingPageProps) => {
  const banner = useAppBannerVert();
  return (
    <div
      style={{
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {showImage && banner}
      <CircularProgress variant="indeterminate" />
    </div>
  );
});
