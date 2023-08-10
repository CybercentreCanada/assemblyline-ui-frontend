import { CircularProgress } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import { memo } from 'react';

const WrappedLoadingScreen = ({ showImage = true }) => {
  const banner = useAppBanner();
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
};

export const LoadingScreen = memo(WrappedLoadingScreen);
export default LoadingScreen;
