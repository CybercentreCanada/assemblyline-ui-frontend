import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { alpha, Slider, styled, Tooltip, useTheme } from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { APP_CAROUSEL_ZOOM_CLASS, toggleAppCarouselZoom, updateAppCarouselZoom } from 'layout/carousel';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

const ZoomAttributes = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: theme.spacing(1),
  height: 0,
  opacity: 0,
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${APP_CAROUSEL_ZOOM_CLASS}`]: { paddingBottom: theme.spacing(1), height: '200px', opacity: 1 }
}));

ZoomAttributes.displayName = 'ZoomAttributes';

//*****************************************************************************************
// AppCarouselZoomControls
//*****************************************************************************************

export const AppCarouselZoomControls = memo(() => {
  const { t } = useTranslation(['carousel']);
  const theme = useTheme();
  const setInterfaceStore = useAppSetInterfaceStore();

  const isZooming = useAppInterfaceStore(s => s.carousel.isZooming);
  const zoom = useAppInterfaceStore(s => s.carousel.zoom);

  const zoomClass = isZooming ? APP_CAROUSEL_ZOOM_CLASS : null;

  const handleToggleZoom = useCallback(
    () => setInterfaceStore(store => toggleAppCarouselZoom(store)),
    [setInterfaceStore]
  );
  const handleZoomChange = useCallback(
    (_event: Event, value: number | number[]) =>
      setInterfaceStore(store => updateAppCarouselZoom(store, Array.isArray(value) ? value[0] : value)),
    [setInterfaceStore]
  );

  return (
    <div
      className={zoomClass}
      style={{
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        borderRadius: theme.spacing(3),
        position: 'fixed',
        top: theme.spacing(1),
        right: theme.spacing(1)
      }}
    >
      <Tooltip title={t('zoom')} placement="left">
        <div>
          <IconButton onClick={handleToggleZoom} size="large">
            {isZooming ? <ZoomOutIcon /> : <ZoomInIcon />}
          </IconButton>
        </div>
      </Tooltip>
      <ZoomAttributes className={zoomClass}>
        <div style={{ textAlign: 'end', minWidth: '35px' }}>{`${zoom}%`}</div>
        <IconButton
          size="small"
          onClick={() => setInterfaceStore(store => updateAppCarouselZoom(store, store.carousel.zoom + 10))}
        >
          <AddIcon fontSize="small" />
        </IconButton>
        <Slider
          value={zoom}
          step={10}
          min={10}
          max={500}
          size="small"
          onChange={handleZoomChange}
          orientation="vertical"
          sx={{ '& .MuiSlider-thumb': { boxShadow: 'none' } }}
        />
        <IconButton
          size="small"
          onClick={() => setInterfaceStore(store => updateAppCarouselZoom(store, store.carousel.zoom - 10))}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
      </ZoomAttributes>
    </div>
  );
});

AppCarouselZoomControls.displayName = 'AppCarouselZoomControls';
