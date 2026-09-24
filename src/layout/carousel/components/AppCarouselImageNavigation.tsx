import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { alpha, styled, Tooltip } from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { APP_CAROUSEL_ZOOM_CLASS, updateAppCarouselIndex } from 'layout/carousel';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

const NavOverlayContainer = styled('div')(() => ({
  height: '100%',
  width: '25%',
  cursor: 'pointer',
  position: 'absolute',
  zIndex: '1',
  [`&.${APP_CAROUSEL_ZOOM_CLASS}`]: { width: '0%' },
  '&:hover>div': { display: 'flex' }
}));

NavOverlayContainer.displayName = 'NavOverlayContainer';

const NavButtonWrapper = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  position: 'absolute',
  top: '50%',
  bottom: '50%',
  display: 'none',
  cursor: 'pointer',
  height: '48px',
  width: '48px'
}));

NavButtonWrapper.displayName = 'NavButtonWrapper';

//*****************************************************************************************
// AppCarouselImageNavigation
//*****************************************************************************************

export type AppCarouselImageNavigationProps = {
  direction: -1 | 1;
};

export const AppCarouselImageNavigation = memo(({ direction }: AppCarouselImageNavigationProps) => {
  const { t } = useTranslation(['carousel']);
  const setInterfaceStore = useAppSetInterfaceStore();

  const images = useAppInterfaceStore(s => s.carousel.images);
  const isZooming = useAppInterfaceStore(s => s.carousel.isZooming);

  const handleImageChange = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      if (!images || images.length <= 1 || isZooming) return;
      setInterfaceStore(store => updateAppCarouselIndex(store, direction));
    },
    [direction, images, isZooming, setInterfaceStore]
  );

  const isPrevious = direction === -1;

  return (
    <NavOverlayContainer
      className={isZooming ? APP_CAROUSEL_ZOOM_CLASS : undefined}
      onClick={handleImageChange}
      style={isPrevious ? { left: '0' } : { right: '0' }}
    >
      <NavButtonWrapper style={isPrevious ? undefined : { right: 0 }}>
        <Tooltip title={t(isPrevious ? 'prev' : 'next')} placement={isPrevious ? 'right' : 'left'}>
          <IconButton component="div" size="large" onClick={handleImageChange}>
            {isPrevious ? <ChevronLeftOutlinedIcon /> : <ChevronRightOutlinedIcon />}
          </IconButton>
        </Tooltip>
      </NavButtonWrapper>
    </NavOverlayContainer>
  );
});

AppCarouselImageNavigation.displayName = 'AppCarouselImageNavigation';
