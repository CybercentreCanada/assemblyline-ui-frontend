import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { LinearProgress, Typography, useTheme } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { default as React, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexLoading = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();

  const rect = useMemo<DOMRect>(() => document.getElementById('hex-viewer')?.getBoundingClientRect(), []);

  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        whiteSpace: 'normal',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        ...(rect && {
          width: rect?.width,
          height: rect?.height
        })
      }}
    >
      <div style={{ width: '100%', textAlign: 'center' }}>
        {store.loading.status === 'loading' && (
          <>
            <Typography variant="subtitle1" color="secondary" padding={theme.spacing(2)}>
              {t(store.loading.message)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={store.loading.progress}
              sx={{ width: '50%', margin: 'auto' }}
            />
          </>
        )}
        {store.loading.status === 'error' && (
          <>
            <Typography variant="subtitle1" color="error" padding={theme.spacing(2)}>
              {store.loading.errors.isDataInvalid && t('error.isInvalidData')}
              {store.loading.errors.isHeightTooSmall && t('error.isHeightTooSmall')}
              {store.loading.errors.isWidthTooSmall && t('error.isWidthTooSmall')}
            </Typography>
            <ErrorOutlineIcon color="error" fontSize="large" />
          </>
        )}
      </div>
    </div>
  );
};

export const HexLoading = React.memo(WrappedHexLoading);
