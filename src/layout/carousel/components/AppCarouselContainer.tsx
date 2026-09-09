import { Modal, styled } from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import {
  AppCarouselCloseButton,
  AppCarouselDetails,
  AppCarouselImage,
  AppCarouselNavigation,
  AppCarouselZoomControls,
  updateAppCarouselIndex
} from 'layout/carousel';
import { memo, useCallback } from 'react';

//*****************************************************************************************
// AppCarouselContainer
//*****************************************************************************************

const Menu = styled('div')(() => ({
  position: 'absolute',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'start',
  justifyItems: 'center'
}));

Menu.displayName = 'Menu';

export const AppCarouselContainer = memo(() => {
  const setInterfaceStore = useAppSetInterfaceStore();

  const open = useAppInterfaceStore(s => s.carousel.open);
  const hasImages = useAppInterfaceStore(s => s.carousel.images.length > 0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
        setInterfaceStore(store => updateAppCarouselIndex(store, -1));
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
        setInterfaceStore(store => updateAppCarouselIndex(store, 1));
    },
    [setInterfaceStore]
  );

  return !hasImages ? null : (
    <Modal
      open={open}
      sx={{
        outline: 'none',
        backdropFilter: 'blur(2px)',
        transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
        zIndex: 1350,
        '&:focus-visible': { outline: 'none' }
      }}
    >
      <div
        id="carousel"
        role="region"
        aria-label="Image carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          height: '100%',
          outline: 'none',
          width: '100%'
        }}
      >
        <AppCarouselImage />
        <Menu id="carousel-menu">
          <AppCarouselCloseButton />
          <AppCarouselDetails />
          <AppCarouselZoomControls />
        </Menu>
        <AppCarouselNavigation />
      </div>
    </Modal>
  );
});

AppCarouselContainer.displayName = 'AppCarouselContainer';
