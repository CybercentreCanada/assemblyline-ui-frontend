import AddIcon from '@mui/icons-material/Add';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { alpha, Button, CircularProgress, Modal, Slider, styled, Tooltip, useTheme } from '@mui/material';
import { useAppImageFetch } from 'core/api';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppLocation } from 'core/routes';
import type { AppCarouselDragging } from 'layout/carousel';
import {
  APP_CAROUSEL_IMAGE_SIZE,
  APP_CAROUSEL_MIN_IMAGE_SIZE_REM,
  APP_CAROUSEL_NAV_BAR_HEIGHT,
  APP_CAROUSEL_ZOOM_CLASS,
  cycleAppCarouselBackgroundMode,
  getAppCarouselBackgroundColor,
  resetAppCarouselState,
  toggleAppCarouselZoom,
  updateAppCarouselIndex,
  updateAppCarouselZoom
} from 'layout/carousel';
import type { Image } from 'models/base/result_body';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

//*****************************************************************************************
// Styled Components
//*****************************************************************************************

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
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundBlendMode: 'soft-light',
  imageRendering: 'unset',
  overflow: 'hidden'
}));

LoadingContainer.displayName = 'LoadingContainer';

const Menu = styled('div')(() => ({
  position: 'absolute',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'start',
  justifyItems: 'center'
}));

Menu.displayName = 'Menu';

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

const MenuPane = styled('div')(({ theme }) => ({
  position: 'absolute',
  maxWidth: 'calc(100% - 128px)',
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  alignItems: 'center',
  borderRadius: '0px 0px 4px 4px',
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  minWidth: '10vw',
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${APP_CAROUSEL_ZOOM_CLASS}`]: { marginTop: '-64px' }
}));

MenuPane.displayName = 'MenuPane';

const Info = styled('div')(({ theme }) => ({
  display: 'grid',
  alignContent: 'end',
  alignItems: 'stretch',
  gridTemplateColumns: 'auto 1fr',
  columnGap: theme.spacing(1),
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  '&:hover>div': { whiteSpace: 'wrap !important' },
  '&>div:nth-of-type(2n+1)': { fontWeight: 500 },
  '&>div:nth-of-type(2n)': {
    fontWeight: 400,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

Info.displayName = 'Info';

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

const ThumbImg = styled('img')(({ theme }) => ({
  minWidth: '50%',
  minHeight: '50%',
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  imageRendering: 'pixelated',
  filter: 'brightness(50%)',
  transition: theme.transitions.create('filter', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  '&:hover': { filter: 'brightness(90%)' }
}));

ThumbImg.displayName = 'ThumbImg';

//*****************************************************************************************
// CarouselItem
//*****************************************************************************************

/** Props for a single carousel thumbnail item. */
export type AppCarouselItemProps = {
  /** Alt text for the image. */
  alt: string;
  /** Position of the image in the carousel. */
  index: number;
  /** Image source hash/identifier. */
  src: string;
};

export const AppCarouselItem = memo(({ alt, index, src }: AppCarouselItemProps) => {
  const theme = useTheme();

  const backgroundMode = useAppInterfaceStore(s => s.carousel.backgroundMode);
  const selected = useAppInterfaceStore(s => s.carousel.index === index);

  const { data: image, isLoading: loading } = useAppImageFetch({ src, alt });

  const augmentedPaper = useMemo(
    () => theme.palette.augmentColor({ color: { main: theme.palette.background.default } }),
    [theme.palette]
  );

  return (
    <Tooltip title={alt} placement="top">
      <Button
        className="carousel-thumb"
        data-carousel-index={index}
        sx={{
          height: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.main : augmentedPaper.dark, 0.7),
          padding: 0,
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.light : augmentedPaper.main, 0.7)
          },
          ...(selected && {
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.light : augmentedPaper.main, 0.5),
            '&>img': { filter: 'brightness(100%)' }
          })
        }}
      >
        {image ? (
          <ThumbImg
            src={image}
            alt={alt}
            draggable={false}
            style={{
              backgroundColor: getAppCarouselBackgroundColor(backgroundMode, theme)
            }}
          />
        ) : loading ? (
          <CircularProgress color="primary" />
        ) : (
          <BrokenImageOutlinedIcon color="primary" fontSize="large" />
        )}
      </Button>
    </Tooltip>
  );
});

AppCarouselItem.displayName = 'AppCarouselItem';

//*****************************************************************************************
// AppCarouselNavigation
//*****************************************************************************************

const AppCarouselNavigation = memo(() => {
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
      className={isZooming ? APP_CAROUSEL_ZOOM_CLASS : null}
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

//*****************************************************************************************
// AppCarouselCloseButton
//*****************************************************************************************

const AppCarouselCloseButton = memo(() => {
  const theme = useTheme();
  const setInterfaceStore = useAppSetInterfaceStore();

  const handleClose = useCallback(() => {
    setInterfaceStore(store => resetAppCarouselState(store));
  }, [setInterfaceStore]);

  return (
    <div
      style={{
        margin: theme.spacing(1),
        borderRadius: theme.spacing(3),
        backgroundColor: alpha(theme.palette.background.paper, 0.7)
      }}
    >
      <Tooltip title="Close" placement="right">
        <IconButton onClick={handleClose} size="large">
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
});

AppCarouselCloseButton.displayName = 'AppCarouselCloseButton';

//*****************************************************************************************
// AppCarouselImageNavigation
//*****************************************************************************************

type AppCarouselImageNavigationProps = {
  direction: -1 | 1;
};

const AppCarouselImageNavigation = memo(({ direction }: AppCarouselImageNavigationProps) => {
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
      className={isZooming ? APP_CAROUSEL_ZOOM_CLASS : null}
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

//*****************************************************************************************
// AppCarouselImage
//*****************************************************************************************

const AppCarouselImage = memo(() => {
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

//*****************************************************************************************
// AppCarouselZoomControls
//*****************************************************************************************

const AppCarouselZoomControls = memo(() => {
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

//*****************************************************************************************
// AppCarouselDetails
//*****************************************************************************************

const AppCarouselDetails = memo(() => {
  const { t } = useTranslation(['carousel']);
  const theme = useTheme();
  const setInterfaceStore = useAppSetInterfaceStore();

  const isFileViewer = useAppLocation('at', 1)(s => s?.route?.startsWith('/file/viewer'));

  const backgroundMode = useAppInterfaceStore(s => s.carousel.backgroundMode);
  const images = useAppInterfaceStore(s => s.carousel.images);
  const index = useAppInterfaceStore(s => s.carousel.index);

  const currentImage = useMemo<Image | null>(() => images[index] ?? null, [images, index]);

  const handleClose = useCallback(() => {
    setInterfaceStore(store => resetAppCarouselState(store));
  }, [setInterfaceStore]);

  const handleBackgroundModeChange = useCallback(() => {
    setInterfaceStore(store => cycleAppCarouselBackgroundMode(store));
  }, [setInterfaceStore]);

  return (
    <MenuPane>
      <Info>
        <div>{t('name')}</div>
        <div>{currentImage?.name ?? null}</div>
        <div>{t('description')}</div>
        <div>{currentImage?.description ?? null}</div>
      </Info>
      <Tooltip title={t('view_file')} placement="bottom">
        <IconButton
          nav={nav =>
            isFileViewer
              ? nav.at(1).create({ route: '/file/viewer/:id/:tab', path: { id: currentImage?.img, tab: 'image' } })
              : nav
                  .at(Infinity)
                  .create({ route: '/file/viewer/:id/:tab', path: { id: currentImage?.img, tab: 'image' } })
          }
          color="inherit"
          style={{ marginLeft: '8px' }}
          onClick={handleClose}
        >
          <PageviewOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('change_background_color')} placement="bottom">
        <IconButton color="inherit" style={{ marginLeft: '8px' }} onClick={handleBackgroundModeChange}>
          <div
            style={{
              height: theme.spacing(2),
              width: theme.spacing(2),
              borderRadius: theme.spacing(0.5),
              backgroundColor:
                backgroundMode === 'transparent'
                  ? theme.palette.grey[500]
                  : getAppCarouselBackgroundColor(backgroundMode, theme)
            }}
          />
        </IconButton>
      </Tooltip>
    </MenuPane>
  );
});

AppCarouselDetails.displayName = 'AppCarouselDetails';

//*****************************************************************************************
// AppCarouselContainer
//*****************************************************************************************

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
