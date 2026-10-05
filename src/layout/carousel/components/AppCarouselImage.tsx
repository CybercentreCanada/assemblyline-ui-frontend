import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { CircularProgress, styled, useTheme } from '@mui/material';
import { useAppImageFetch } from 'core/api';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import type { AppCarouselDragging } from 'layout/carousel';
import {
  APP_CAROUSEL_IMAGE_SIZE,
  APP_CAROUSEL_MIN_IMAGE_SIZE_REM,
  APP_CAROUSEL_NAV_BAR_HEIGHT,
  APP_CAROUSEL_ZOOM_CLASS,
  AppCarouselImageNavigation,
  getAppCarouselBackgroundColor,
  resetAppCarouselState,
  toggleAppCarouselZoom,
  updateAppCarouselZoom
} from 'layout/carousel';
import type { Image } from 'models/base/result_body';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

const ImageContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  top: '64px',
  bottom: APP_CAROUSEL_NAV_BAR_HEIGHT,
  display: 'grid',
  placeItems: 'center',
  overflow: 'scroll',
  userSelect: 'none',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${APP_CAROUSEL_ZOOM_CLASS}`]: { top: 0, bottom: 0, left: 0, right: 0 }
}));

ImageContainer.displayName = 'ImageContainer';

const Img = styled('img')(({ theme }) => ({
  height: 'auto',
  width: 'auto',
  minHeight: APP_CAROUSEL_IMAGE_SIZE,
  minWidth: APP_CAROUSEL_IMAGE_SIZE,
  maxWidth: '100vw',
  maxHeight: `calc(100vh - 64px - ${APP_CAROUSEL_NAV_BAR_HEIGHT})`,
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${APP_CAROUSEL_ZOOM_CLASS}`]: { maxHeight: 'none', maxWidth: 'none' }
}));

Img.displayName = 'Img';

const LoadingContainer = styled('div')(({ theme }) => ({
  height: `calc(2 * ${APP_CAROUSEL_NAV_BAR_HEIGHT})`,
  aspectRatio: '4 / 3',
  display: 'grid',
  placeItems: 'center',
  borderRadius: theme.spacing(0.5),
  backgroundColor: theme.palette.action.hover,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundBlendMode: 'soft-light',
  imageRendering: 'unset',
  overflow: 'hidden'
}));

LoadingContainer.displayName = 'LoadingContainer';

//*****************************************************************************************
// AppCarouselImage
//*****************************************************************************************

export const AppCarouselImage = memo(() => {
  const theme = useTheme();
  const setInterfaceStore = useAppSetInterfaceStore();

  const backgroundMode = useAppInterfaceStore(s => s.carousel.backgroundMode);
  const imageRendering = useAppInterfaceStore(s => s.carousel.imageRendering);
  const images = useAppInterfaceStore(s => s.carousel.images);
  const index = useAppInterfaceStore(s => s.carousel.index);
  const isZooming = useAppInterfaceStore(s => s.carousel.isZooming);
  const zoom = useAppInterfaceStore(s => s.carousel.zoom);

  const currentImage = useMemo<Image | null>(() => images[index] ?? null, [images, index]);

  const { data: thumbData } = useAppImageFetch({ src: currentImage?.thumb ?? null });
  const { data: imgData, isLoading: loading } = useAppImageFetch({ src: currentImage?.img ?? null });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageDrag = useRef<AppCarouselDragging>({
    isDown: false,
    isDragging: false,
    scrollLeft: 0,
    scrollTop: 0,
    startX: 0,
    startY: 0
  });

  const zoomTimer = useRef<number>(null);
  const dragTimer = useRef<number>(null);

  const zoomClass = isZooming ? APP_CAROUSEL_ZOOM_CLASS : null;

  const handleClose = useCallback(() => {
    setInterfaceStore(store => resetAppCarouselState(store));
  }, [setInterfaceStore]);

  const handleZoomDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    dragTimer.current = Date.now();
    imageDrag.current = {
      isDown: true,
      startX: event.pageX - containerRef.current.offsetLeft,
      startY: event.pageY - containerRef.current.offsetTop,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    };
  }, []);

  const handleZoomStop = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageDrag.current.isDown) return;
    event.stopPropagation();
    if (event.button !== 0) return;

    const timeDiff = Date.now() - dragTimer.current;
    const speedY = ((containerRef.current.scrollTop - imageDrag.current.scrollTop) / timeDiff) * 15;
    const speedX = ((containerRef.current.scrollLeft - imageDrag.current.scrollLeft) / timeDiff) * 15;
    let speedYAbs = Math.abs(speedY);
    let speedXAbs = Math.abs(speedX);

    const draw = () => {
      if (speedYAbs > 0) {
        containerRef.current.scrollTop += speedY > 0 ? speedYAbs-- : -speedYAbs--;
      }
      if (speedXAbs > 0) {
        containerRef.current.scrollLeft += speedX > 0 ? speedXAbs-- : -speedXAbs--;
      }
      if (speedYAbs > 0 || speedXAbs > 0) requestAnimationFrame(draw);
    };
    draw();

    imageDrag.current = { isDown: false, scrollLeft: 0, scrollTop: 0, startX: 0, startY: 0 };
  }, []);

  const handleZoomWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.stopPropagation();
      setInterfaceStore(store => updateAppCarouselZoom(store, store.carousel.zoom - event.deltaY / 10));
    },
    [setInterfaceStore]
  );

  const handleZoomMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageDrag.current.isDown || event.button !== 0) return;
    event.preventDefault();
    const x = event.pageX - containerRef.current.offsetLeft;
    containerRef.current.scrollLeft = imageDrag.current.scrollLeft - (x - imageDrag.current.startX);
    const y = event.pageY - containerRef.current.offsetTop;
    containerRef.current.scrollTop = imageDrag.current.scrollTop - (y - imageDrag.current.startY);
  }, []);

  const handleZoomClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (event.button !== 0) return;
      const now = Date.now();
      if (now - zoomTimer.current < 200) {
        setInterfaceStore(store => toggleAppCarouselZoom(store));
      }
      zoomTimer.current = now;
    },
    [setInterfaceStore]
  );

  useEffect(() => {
    if (!imgData) return;
    const i = new Image();
    i.onload = () => {
      setInterfaceStore(store => {
        store.carousel.imageRendering = i.width <= 128 || i.height <= 128 ? 'pixelated' : 'auto';
        return store;
      });
    };
    i.src = imgData;
  }, [imgData, setInterfaceStore]);

  return (
    <ImageContainer
      ref={containerRef}
      className={zoomClass}
      onClick={!isZooming ? handleClose : undefined}
      onMouseDown={isZooming ? handleZoomDown : undefined}
      onMouseUp={isZooming ? handleZoomStop : undefined}
      onMouseLeave={isZooming ? handleZoomStop : undefined}
      onMouseMove={isZooming ? handleZoomMove : undefined}
      onWheel={isZooming ? handleZoomWheel : undefined}
    >
      <AppCarouselImageNavigation direction={-1} />
      {imgData ? (
        <Img
          ref={imgRef}
          className={zoomClass}
          src={imgData}
          alt={currentImage?.name}
          draggable={false}
          style={{
            backgroundColor: getAppCarouselBackgroundColor(backgroundMode, theme),
            imageRendering,
            ...(isZooming &&
              imgRef.current && {
                width:
                  imgRef.current.naturalWidth > 128
                    ? `calc(${zoom / 100} * ${imgRef.current.naturalWidth}px)`
                    : `calc(${zoom / 100} * ${APP_CAROUSEL_MIN_IMAGE_SIZE_REM}rem)`,
                height:
                  imgRef.current.naturalHeight > 128
                    ? `calc(${zoom / 100} * ${imgRef.current.naturalHeight}px)`
                    : `calc(${zoom / 100} * ${APP_CAROUSEL_MIN_IMAGE_SIZE_REM}rem)`,
                minWidth: 0,
                minHeight: 0
              })
          }}
          onClick={handleZoomClick}
        />
      ) : (
        <LoadingContainer style={thumbData ? { backgroundImage: `url(${thumbData})` } : undefined}>
          {loading ? (
            <CircularProgress color="primary" />
          ) : (
            <BrokenImageOutlinedIcon color="primary" fontSize="large" />
          )}
        </LoadingContainer>
      )}
      <AppCarouselImageNavigation direction={1} />
    </ImageContainer>
  );
});

AppCarouselImage.displayName = 'AppCarouselImage';
