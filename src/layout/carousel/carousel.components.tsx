import AddIcon from '@mui/icons-material/Add';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import type { Theme } from '@mui/material';
import {
  alpha,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  Skeleton,
  Slider,
  styled,
  Tooltip,
  useTheme
} from '@mui/material';
import { useBackgroundMode, useCarouselKeyboard, useImageFetch } from 'layout/carousel/carousel.hooks';
import type {
  BackgroundMode,
  CarouselContainerProps,
  CarouselItemProps,
  Dragging
} from 'layout/carousel/carousel.models';
import { IMAGE_SIZE, MIN_IMAGE_SIZE_REM, NAV_BAR_HEIGHT, ZOOM_CLASS } from 'layout/carousel/carousel.models';
import type { Image } from 'models/base/result_body';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

//*****************************************************************************************
// Styled Components
//*****************************************************************************************

const ImageContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  top: '64px',
  bottom: NAV_BAR_HEIGHT,
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
  [`&.${ZOOM_CLASS}`]: { top: 0, bottom: 0, left: 0, right: 0 }
}));

ImageContainer.displayName = 'ImageContainer';

const NavOverlayContainer = styled('div')(() => ({
  height: '100%',
  width: '25%',
  cursor: 'pointer',
  position: 'absolute',
  zIndex: '1',
  [`&.${ZOOM_CLASS}`]: { width: '0%' },
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
  minHeight: IMAGE_SIZE,
  minWidth: IMAGE_SIZE,
  maxWidth: '100vw',
  maxHeight: `calc(100vh - 64px - ${NAV_BAR_HEIGHT})`,
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${ZOOM_CLASS}`]: { maxHeight: 'none', maxWidth: 'none' }
}));

Img.displayName = 'Img';

const LoadingContainer = styled('div')(({ theme }) => ({
  height: `calc(2 * ${NAV_BAR_HEIGHT})`,
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
  [`&.${ZOOM_CLASS}`]: { paddingBottom: theme.spacing(1), height: '200px', opacity: 1 }
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
  [`&.${ZOOM_CLASS}`]: { marginTop: '-64px' }
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
  '&>div:nth-child(2n+1)': { fontWeight: 500 },
  '&>div:nth-child(2n)': {
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
  height: NAV_BAR_HEIGHT,
  overflow: 'scroll',
  userSelect: 'none',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${ZOOM_CLASS}`]: { bottom: `calc(0px - ${NAV_BAR_HEIGHT})` }
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
// Utilities
//*****************************************************************************************

const getBackgroundColor = (mode: BackgroundMode, theme: Theme): string => {
  switch (mode) {
    case 'light':
      return theme.palette.grey[100];
    case 'dark':
      return theme.palette.grey[900];
    default:
      return 'transparent';
  }
};

//*****************************************************************************************
// CarouselItem
//*****************************************************************************************

export const CarouselItem = memo(({ alt, backgroundMode, onClick, selected, src }: CarouselItemProps) => {
  const theme = useTheme();
  const { data, fetchImage, loading } = useImageFetch();

  const augmentedPaper = useMemo(
    () => theme.palette.augmentColor({ color: { main: theme.palette.background.default } }),
    [theme.palette]
  );

  useEffect(() => {
    fetchImage(src);
  }, [fetchImage, src]);

  return (
    <Tooltip title={alt} placement="top">
      <Button
        className="carousel-thumb"
        onMouseUp={onClick}
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
        {data ? (
          <ThumbImg
            src={data}
            alt={alt}
            draggable={false}
            style={{
              backgroundColor:
                backgroundMode === 'transparent' ? 'transparent' : getBackgroundColor(backgroundMode, theme)
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

CarouselItem.displayName = 'CarouselItem';

//*****************************************************************************************
// CarouselContainer
//*****************************************************************************************

export const CarouselContainer = memo(({ images, index, onClose, open, setIndex }: CarouselContainerProps) => {
  const { t } = useTranslation(['carousel']);
  const theme = useTheme();
  const location = useLocation();

  const { data: thumbData, fetchImage: fetchThumb } = useImageFetch();
  const { data: imgData, fetchImage: fetchImg, loading } = useImageFetch();

  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [imageRendering, setImageRendering] = useState<'auto' | 'pixelated'>('auto');
  const { backgroundMode, toggleBackgroundMode } = useBackgroundMode();

  const navbarRef = useRef<HTMLDivElement>(null);
  const navbarScroll = useRef<Dragging>({ isDown: false, isDragging: false, scrollLeft: 0, startX: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageDrag = useRef<Dragging>({
    isDown: false,
    isDragging: false,
    scrollLeft: 0,
    scrollTop: 0,
    startX: 0,
    startY: 0
  });
  const zoomTimer = useRef<number>(null);
  const dragTimer = useRef<number>(null);

  const zoomClass = useMemo<string | null>(() => (isZooming ? ZOOM_CLASS : null), [isZooming]);
  const currentImage = useMemo<Image | null>(() => (images ? images[index] : null), [images, index]);

  const handleClose = useCallback(() => {
    setIsZooming(false);
    onClose();
  }, [onClose]);

  const handleImageChange = useCallback(
    (value: number) => (event?: React.MouseEvent) => {
      event?.stopPropagation();
      if (!images || images.length <= 1 || isZooming) return;
      setIndex(i => (i + value + images.length) % images.length);
    },
    [images, isZooming, setIndex]
  );

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

  const handleZoomWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setZoom(z => Math.round(Math.min(Math.max(z - event.deltaY / 10, 10), 500)));
  }, []);

  const handleZoomMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageDrag.current.isDown || event.button !== 0) return;
    event.preventDefault();
    const x = event.pageX - containerRef.current.offsetLeft;
    containerRef.current.scrollLeft = imageDrag.current.scrollLeft - (x - imageDrag.current.startX);
    const y = event.pageY - containerRef.current.offsetTop;
    containerRef.current.scrollTop = imageDrag.current.scrollTop - (y - imageDrag.current.startY);
  }, []);

  const handleNavbarDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    navbarScroll.current = {
      isDown: true,
      isDragging: false,
      startX: event.pageX - navbarRef.current.offsetLeft,
      scrollLeft: navbarRef.current.scrollLeft
    };
  }, []);

  const handleNavbarStop = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
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

  const handleZoomChange = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setIsZooming(z => !z);
    setZoom(100);
  }, []);

  const handleZoomClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.button !== 0) return;
    const now = Date.now();
    if (now - zoomTimer.current < 200) {
      setIsZooming(z => !z);
      setZoom(100);
    }
    zoomTimer.current = now;
  }, []);

  const { onKeyDown } = useCarouselKeyboard(
    !isZooming ? handleImageChange(-1) : null,
    !isZooming ? handleImageChange(1) : null
  );

  useEffect(() => {
    if (!currentImage) return;
    fetchThumb(currentImage.thumb);
    fetchImg(currentImage.img);
  }, [currentImage, fetchImg, fetchThumb]);

  useEffect(() => {
    const thumbs = document.getElementById('carousel')?.querySelectorAll('.carousel-thumb');
    if (!thumbs || index < 0 || index >= thumbs?.length) return;
    thumbs[index]?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }, [imgData, index]);

  useEffect(() => {
    if (!imgData) return;
    const i = new Image();
    i.onload = () => {
      setImageRendering(i.width <= 128 || i.height <= 128 ? 'pixelated' : 'auto');
    };
    i.src = imgData;
  }, [imgData]);

  return images?.length > 0 ? (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        outline: 'none',
        backdropFilter: 'blur(2px)',
        transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
        zIndex: 1350,
        '&:focus-visible': { outline: 'none' }
      }}
    >
      <div id="carousel" tabIndex={-1} onKeyDown={onKeyDown} style={{ height: '100%', width: '100%', outline: 'none' }}>
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
          <NavOverlayContainer className={zoomClass} onClick={handleImageChange(-1)} style={{ left: '0' }}>
            <NavButtonWrapper>
              <Tooltip title={t('prev')} placement="right">
                <IconButton component="div" size="large" onClick={handleImageChange(-1)}>
                  <ChevronLeftOutlinedIcon />
                </IconButton>
              </Tooltip>
            </NavButtonWrapper>
          </NavOverlayContainer>

          {imgData ? (
            <Img
              ref={imgRef}
              className={zoomClass}
              src={imgData}
              alt={currentImage?.name}
              draggable={false}
              style={{
                backgroundColor: getBackgroundColor(backgroundMode, theme),
                imageRendering,
                ...(isZooming &&
                  imgRef.current && {
                    width:
                      imgRef.current.naturalWidth > 128
                        ? `calc(${zoom / 100} * ${imgRef.current.naturalWidth}px)`
                        : `calc(${zoom / 100} * ${MIN_IMAGE_SIZE_REM}rem)`,
                    height:
                      imgRef.current.naturalHeight > 128
                        ? `calc(${zoom / 100} * ${imgRef.current.naturalHeight}px)`
                        : `calc(${zoom / 100} * ${MIN_IMAGE_SIZE_REM}rem)`,
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

          <NavOverlayContainer className={zoomClass} onClick={handleImageChange(1)} style={{ right: '0' }}>
            <NavButtonWrapper style={{ right: 0 }}>
              <Tooltip title={t('next')} placement="left">
                <IconButton component="div" size="large" onClick={handleImageChange(1)}>
                  <ChevronRightOutlinedIcon />
                </IconButton>
              </Tooltip>
            </NavButtonWrapper>
          </NavOverlayContainer>
        </ImageContainer>

        <Menu id="carousel-menu">
          <div
            style={{
              margin: theme.spacing(1),
              borderRadius: theme.spacing(3),
              backgroundColor: alpha(theme.palette.background.paper, 0.7)
            }}
          >
            <Tooltip title={t('close')} placement="right">
              <IconButton onClick={handleClose} size="large">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </div>

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
                <IconButton onClick={imgData ? handleZoomChange : undefined} size="large" disabled={!imgData}>
                  {isZooming ? <ZoomOutIcon /> : <ZoomInIcon />}
                </IconButton>
              </div>
            </Tooltip>
            <ZoomAttributes className={zoomClass}>
              <div style={{ textAlign: 'end', minWidth: '35px' }}>{`${zoom}%`}</div>
              <IconButton size="small" onClick={() => setZoom(z => Math.min(500, z + 10))}>
                <AddIcon fontSize="small" />
              </IconButton>
              <Slider
                value={zoom}
                step={10}
                min={10}
                max={500}
                size="small"
                onChange={(_, newValue) => setZoom(Math.floor(newValue))}
                orientation="vertical"
                sx={{ '& .MuiSlider-thumb': { boxShadow: 'none' } }}
              />
              <IconButton size="small" onClick={() => setZoom(z => Math.max(10, z - 10))}>
                <RemoveIcon fontSize="small" />
              </IconButton>
            </ZoomAttributes>
          </div>

          <MenuPane className={zoomClass}>
            <Info>
              <div>{t('name')}</div>
              <div>{currentImage ? currentImage.name : loading ? <Skeleton variant="rounded" /> : null}</div>
              <div>{t('description')}</div>
              <div>{currentImage ? currentImage.description : loading ? <Skeleton variant="rounded" /> : null}</div>
            </Info>
            <Tooltip title={t('view_file')} placement="bottom">
              <IconButton
                component={Link}
                to={`/file/viewer/${currentImage?.img}/image/${location.search}${location.hash}`}
                color="inherit"
                style={{ marginLeft: '8px' }}
                onClick={handleClose}
              >
                <PageviewOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('change_background_color')} placement="bottom">
              <IconButton color="inherit" style={{ marginLeft: '8px' }} onClick={toggleBackgroundMode}>
                <div
                  style={{
                    height: theme.spacing(2),
                    width: theme.spacing(2),
                    borderRadius: theme.spacing(0.5),
                    backgroundColor:
                      backgroundMode === 'transparent'
                        ? theme.palette.grey[500]
                        : getBackgroundColor(backgroundMode, theme)
                  }}
                />
              </IconButton>
            </Tooltip>
          </MenuPane>
        </Menu>

        <NavBarContainer
          id="carousel-navbar"
          ref={navbarRef}
          className={zoomClass}
          onMouseDown={handleNavbarDown}
          onMouseLeave={handleNavbarStop}
          onMouseUp={handleNavbarStop}
          onMouseMove={handleNavbarMove}
        >
          <NavBar>
            {images.map((image, i) => (
              <CarouselItem
                key={`thumb-${i}`}
                alt={image.name}
                src={image.thumb}
                selected={index === i}
                backgroundMode={backgroundMode}
                onClick={() => !navbarScroll.current.isDragging && setIndex(i)}
              />
            ))}
          </NavBar>
        </NavBarContainer>
      </div>
    </Modal>
  ) : null;
});

CarouselContainer.displayName = 'CarouselContainer';
