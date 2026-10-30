import { styled } from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import type { AppCarouselDragging } from 'layout/carousel';
import { APP_CAROUSEL_NAV_BAR_HEIGHT, APP_CAROUSEL_ZOOM_CLASS, AppCarouselItem } from 'layout/carousel';
import { memo, useCallback, useEffect, useRef } from 'react';

const NavBarContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: APP_CAROUSEL_NAV_BAR_HEIGHT,
  overflow: 'scroll',
  userSelect: 'none',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${APP_CAROUSEL_ZOOM_CLASS}`]: { bottom: `calc(0px - ${APP_CAROUSEL_NAV_BAR_HEIGHT})` }
}));

NavBarContainer.displayName = 'NavBarContainer';

const NavBar = styled('div')(({ theme }) => ({
  height: '100%',
  width: 'fit-content',
  minWidth: '100%',
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1)
}));

NavBar.displayName = 'NavBar';

//*****************************************************************************************
// AppCarouselNavigation
//*****************************************************************************************

export const AppCarouselNavigation = memo(() => {
  const setInterfaceStore = useAppSetInterfaceStore();

  const images = useAppInterfaceStore(s => s.carousel.images);
  const index = useAppInterfaceStore(s => s.carousel.index);
  const isZooming = useAppInterfaceStore(s => s.carousel.isZooming);

  const navbarRef = useRef<HTMLDivElement>(null);
  const navbarScroll = useRef<AppCarouselDragging>({
    isDown: false,
    isDragging: false,
    scrollLeft: 0,
    startX: 0
  });

  const handleNavbarDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    navbarScroll.current = {
      isDown: true,
      isDragging: false,
      startX: event.pageX - navbarRef.current.offsetLeft,
      scrollLeft: navbarRef.current.scrollLeft
    };
  }, []);

  const handleNavbarUp = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement;
      const thumbnail = target.closest<HTMLElement>('.carousel-thumb');
      const nextIndex = Number(thumbnail?.dataset.carouselIndex);
      if (!navbarScroll.current.isDragging && Number.isInteger(nextIndex)) {
        setInterfaceStore(store => {
          store.carousel.index = nextIndex;
          return store;
        });
      }

      navbarScroll.current = { isDown: false, isDragging: false, scrollLeft: 0, startX: 0 };
    },
    [setInterfaceStore]
  );

  const handleNavbarLeave = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.button !== 0) return;
    navbarScroll.current = { isDown: false, isDragging: false, scrollLeft: 0, startX: 0 };
  }, []);

  const handleNavbarMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!navbarScroll.current.isDown || event.button !== 0) return;
    event.preventDefault();
    const x = event.pageX - navbarRef.current.offsetLeft;
    const walkX = x - navbarScroll.current.startX;
    navbarRef.current.scrollLeft = navbarScroll.current.scrollLeft - walkX;
    navbarScroll.current.isDragging = Math.abs(walkX) > 20;
  }, []);

  useEffect(() => {
    navbarRef.current?.querySelectorAll<HTMLElement>('.carousel-thumb')[index]?.scrollIntoView({
      inline: 'center',
      behavior: 'smooth'
    });
  }, [index]);

  return (
    <NavBarContainer
      id="carousel-navbar"
      ref={navbarRef}
      className={isZooming ? APP_CAROUSEL_ZOOM_CLASS : undefined}
      onMouseDown={handleNavbarDown}
      onMouseLeave={handleNavbarLeave}
      onMouseUp={handleNavbarUp}
      onMouseMove={handleNavbarMove}
    >
      <NavBar>
        {images.map((image, imageIndex) => (
          <AppCarouselItem key={`${image.thumb}-${imageIndex}`} alt={image.name} index={imageIndex} src={image.thumb} />
        ))}
      </NavBar>
    </NavBarContainer>
  );
});

AppCarouselNavigation.displayName = 'AppCarouselNavigation';
