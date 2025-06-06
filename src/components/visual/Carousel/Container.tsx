import { ZoomIn, ZoomOut } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import { CircularProgress, IconButton, Modal, Skeleton, Slider, Tooltip, alpha, styled, useTheme } from '@mui/material';
import Carousel from 'commons/addons/carousel/Carousel';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Image as ImageData } from 'components/models/base/result_body';
import CarouselItem from 'components/visual/Carousel/Item';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

const ZOOM_CLASS = 'zooming';
const MIN_IMAGE_SIZE_REM = 4;
const NAV_BAR_HEIGHT = 'min(128px, 30vw, 30vh)';
const IMAGE_SIZE = `min(${MIN_IMAGE_SIZE_REM}rem, 30vw, 30vh)`;

const ImageContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  top: '64px',
  bottom: NAV_BAR_HEIGHT,
  display: 'grid',
  placeItems: 'center',
  overflow: 'scroll',
  userSelect: 'none',
  scrollbarWidth: 'none', // Firefox
  '-ms-overflow-style': 'none', // Internet Explorer 10+
  '&::-webkit-scrollbar': {
    display: 'none' // Safari and Chrome
  },
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${ZOOM_CLASS}`]: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
}));

const NavOverlayContainer = styled('div')(({ theme }) => ({
  height: '100%',
  width: '25%',
  cursor: 'pointer',
  position: 'absolute',
  zIndex: '1',
  [`&.${ZOOM_CLASS}`]: {
    width: '0%'
  },
  '&:hover>div': {
    display: 'flex'
  }
}));

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
  [`&.${ZOOM_CLASS}`]: {
    maxHeight: 'none',
    maxWidth: 'none'
  }
}));

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

const Menu = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'start',
  justifyItems: 'center'
}));

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
  [`&.${ZOOM_CLASS}`]: {
    paddingBottom: theme.spacing(1),
    height: '200px',
    opacity: 1
  }
}));

const MenuPane = styled('div')(({ theme }) => ({
  position: 'absolute',
  maxWidth: 'calc(100% - 128px)',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  borderRadius: '0px 0px 4px 4px',
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  minWidth: '10vw',
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${ZOOM_CLASS}`]: {
    marginTop: '-64px'
  }
}));

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
  '&:hover>div': {
    whiteSpace: 'wrap !important'
  },
  '&>div:nth-child(2n+1)': {
    fontWeight: 500
  },
  '&>div:nth-child(2n)': {
    fontWeight: 400,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

const NavBarContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: NAV_BAR_HEIGHT,
  overflow: 'scroll',
  userSelect: 'none',
  scrollbarWidth: 'none', // Firefox
  '-ms-overflow-style': 'none', // Internet Explorer 10+
  '&::-webkit-scrollbar': {
    display: 'none' // Safari and Chrome
  },
  transition: theme.transitions.create(['all'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  [`&.${ZOOM_CLASS}`]: {
    bottom: `calc(0px - ${NAV_BAR_HEIGHT})`
  }
}));

const NavBar = styled('div')(({ theme }) => ({
  height: '100%',
  width: 'fit-content',
  minWidth: '100%',
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1)
}));

type Dragging = {
  isDown: boolean;
  isDragging?: boolean;
  scrollLeft?: number;
  scrollTop?: number;
  startX?: number;
  startY?: number;
};

type CarouselContainerProps = {
  images: ImageData[];
  open: boolean;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
};

const WrappedCarouselContainer = ({
  images = [],
  open = false,
  index = 0,
  setIndex = () => null,
  onClose = () => null
}: CarouselContainerProps) => {
  const { t } = useTranslation('carousel');
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const location = useLocation();

  const [thumbData, setThumbData] = useState<string>(null);
  const [imgData, setImgData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [imageRendering, setImageRendering] = useState<'auto' | 'pixelated'>('auto' as const);

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
  const zoomClass = useMemo<string | null>(() => isZooming && ZOOM_CLASS, [isZooming]);

  const currentImage = useMemo<ImageData>(() => images && images[index], [images, index]);
  const dragTimer = useRef<number>(null);

  const handleClose = useCallback(
    (event: any = null) => {
      setIsZooming(false);
      onClose();
    },
    [onClose]
  );

  const handleImageChange = useCallback(
    (value: number) =>
      (event: any = null) => {
        event?.stopPropagation();
        if (!images && images.length <= 1 && isZooming) return;
        setIndex(i => (i + value + images.length) % images.length);
      },
    [images, isZooming, setIndex]
  );

  const handleZoomDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    dragTimer.current = new Date().valueOf();
    imageDrag.current = {
      isDown: true,
      startX: event.pageX - containerRef.current.offsetLeft,
      startY: event.pageY - containerRef.current.offsetTop,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    };
  }, []);

  const handleZoomStop = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Ignore if we are not currently dragging
    if (!imageDrag.current.isDown) return;

    event.stopPropagation();
    if (event.button !== 0) return;

    // Calculate dragging speed
    const timeDiff = (new Date() as any) - dragTimer.current;
    const speedY = ((containerRef.current.scrollTop - imageDrag.current.scrollTop.valueOf()) / timeDiff) * 15;
    const speedX = ((containerRef.current.scrollLeft - imageDrag.current.scrollLeft.valueOf()) / timeDiff) * 15;
    let speedYAbsolute = Math.abs(speedY);
    let speedXAbsolute = Math.abs(speedX);

    // Request delayed drawing of the scroll
    const draw = () => {
      if (speedYAbsolute > 0) {
        if (speedY > 0) {
          containerRef.current.scrollTop += speedYAbsolute--;
        } else {
          containerRef.current.scrollTop -= speedYAbsolute--;
        }
      }
      if (speedXAbsolute > 0) {
        if (speedX > 0) {
          containerRef.current.scrollLeft += speedXAbsolute--;
        } else {
          containerRef.current.scrollLeft -= speedXAbsolute--;
        }
      }
      requestAnimationFrame(draw);
    };
    draw();

    imageDrag.current = {
      isDown: false,
      scrollLeft: 0,
      scrollTop: 0,
      startX: 0,
      startY: 0
    };
  }, []);

  const handleZoomWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setZoom(z => Math.round(Math.min(Math.max(z - event.deltaY / 10, 10), 500)));
  }, []);

  const handleZoomMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!imageDrag.current.isDown || event.button !== 0) return;
    event.preventDefault();

    const x = event.pageX - containerRef.current.offsetLeft;
    const walkX = x - imageDrag.current.startX;
    containerRef.current.scrollLeft = imageDrag.current.scrollLeft.valueOf() - walkX;

    const y = event.pageY - containerRef.current.offsetTop;
    const walkY = y - imageDrag.current.startY;
    containerRef.current.scrollTop = imageDrag.current.scrollTop.valueOf() - walkY;
  }, []);

  const handleNavbarDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.button !== 0) return;
    navbarScroll.current = {
      isDown: true,
      isDragging: false,
      startX: event.pageX - navbarRef.current.offsetLeft,
      scrollLeft: navbarRef.current.scrollLeft
    };
  }, []);

  const handleNavbarStop = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.button !== 0) return;
    navbarScroll.current = { isDown: false, isDragging: false, scrollLeft: 0, startX: 0 };
  }, []);

  const handleNavbarMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!navbarScroll.current.isDown || event.button !== 0) return;
    event.preventDefault();
    const x = event.pageX - navbarRef.current.offsetLeft;
    const walkX = x - navbarScroll.current.startX;
    navbarRef.current.scrollLeft = navbarScroll.current.scrollLeft.valueOf() - walkX;
    navbarScroll.current.isDragging = Math.abs(walkX) > 20;
  }, []);

  const handleZoomChange = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    setIsZooming(z => !z);
    setZoom(100);
  }, []);

  const handleZoomClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

  useEffect(() => {
    if (!currentImage) return;
    apiCall({
      url: `/api/v4/file/image/${currentImage.thumb}/`,
      allowCache: true,
      onSuccess: api_data => setThumbData(api_data.api_response),
      onFailure: () => setThumbData(null)
    });
    apiCall({
      url: `/api/v4/file/image/${currentImage.img}/`,
      allowCache: true,
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false),
      onSuccess: api_data => setImgData(api_data.api_response),
      onFailure: () => setImgData(null)
    });

    return () => {
      setThumbData(null);
      setImgData(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]);

  useEffect(() => {
    const thumbs = document.getElementById('carousel')?.querySelectorAll('.carousel-thumb');
    if (!thumbs || index < 0 || index >= thumbs?.length) return;
    thumbs[index]?.scrollIntoView({
      inline: 'center',
      behavior: 'smooth'
    });
  }, [imgData, index]);

  useEffect(() => {
    if (imgData !== null) {
      const i = new Image();
      i.onload = function () {
        if (i.width <= 128 || i.height <= 128) {
          setImageRendering('pixelated');
        } else {
          setImageRendering('auto');
        }
      };
      i.src = imgData;
    }
  }, [imgData]);

  return (
    images &&
    images.length > 0 && (
      <Carousel
        onPrevious={!isZooming ? handleImageChange(-1) : null}
        onNext={!isZooming ? handleImageChange(1) : null}
      >
        <Modal
          open={open}
          onClose={handleClose}
          sx={{
            outline: 'none',
            backdropFilter: 'blur(2px)',
            transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
            zIndex: 1350,
            '&:focus-visible': {
              outline: 'none'
            }
          }}
        >
          <div id="carousel" style={{ height: '100%', width: '100%', outline: 'none' }}>
            <ImageContainer
              ref={containerRef}
              className={zoomClass}
              onClick={!isZooming ? handleClose : null}
              onMouseDown={isZooming ? handleZoomDown : null}
              onMouseUp={isZooming ? handleZoomStop : null}
              onMouseLeave={isZooming ? handleZoomStop : null}
              onMouseMove={isZooming ? handleZoomMove : null}
              onWheel={isZooming ? handleZoomWheel : null}
            >
              <NavOverlayContainer className={zoomClass} onClick={handleImageChange(-1)} style={{ left: '0' }}>
                <NavButtonWrapper>
                  <Tooltip title={t('prev')} placement="right">
                    <IconButton
                      component="div"
                      size="large"
                      children={<ChevronLeftOutlinedIcon />}
                      onClick={handleImageChange(-1)}
                    />
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
                    imageRendering: imageRendering,
                    ...(isZooming && {
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
                  onClick={imgData ? handleZoomClick : null}
                />
              ) : (
                <LoadingContainer style={!thumbData ? null : { backgroundImage: `url(${thumbData})` }}>
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
                    <IconButton
                      component="div"
                      size="large"
                      children={<ChevronRightOutlinedIcon />}
                      onClick={handleImageChange(1)}
                    />
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
                  <IconButton onClick={handleClose} size="large" children={<CloseIcon />} />
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
                    <IconButton
                      onClick={imgData ? handleZoomChange : null}
                      size="large"
                      disabled={!imgData}
                      children={isZooming ? <ZoomOut /> : <ZoomIn />}
                    />
                  </div>
                </Tooltip>
                <ZoomAttributes className={zoomClass}>
                  <div style={{ textAlign: 'end', minWidth: '35px' }}>{`${zoom}%`}</div>
                  <IconButton
                    size="small"
                    onClick={() => setZoom(z => Math.min(500, z + 10))}
                    children={<AddIcon fontSize="small" />}
                  />
                  <Slider
                    value={zoom}
                    step={10}
                    min={10}
                    max={500}
                    size="small"
                    onChange={(event, newValue) => setZoom(Math.floor(newValue))}
                    orientation="vertical"
                    sx={{
                      '& .MuiSlider-thumb': {
                        boxShadow: 'none'
                      }
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setZoom(z => Math.max(10, z - 10))}
                    children={<RemoveIcon fontSize="small" />}
                  />
                </ZoomAttributes>
              </div>

              <MenuPane className={zoomClass}>
                <Info>
                  <div>{t('name')}</div>
                  <div>{currentImage ? currentImage?.name : loading && <Skeleton variant="rounded" />}</div>
                  <div>{t('description')}</div>
                  <div>{currentImage ? currentImage?.description : loading && <Skeleton variant="rounded" />}</div>
                </Info>
                <Tooltip title={t('view_file')} placement="bottom">
                  <IconButton
                    component={Link}
                    to={`/file/viewer/${currentImage.img}/image/${location.search}${location.hash}`}
                    color="inherit"
                    // size="small"
                    style={{ marginLeft: '8px' }}
                    onClick={e => {
                      handleClose();
                    }}
                  >
                    <PageviewOutlinedIcon />
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
                    key={'thumb-' + i}
                    alt={image.name}
                    src={image.thumb}
                    selected={index === i}
                    onClick={() => !navbarScroll.current.isDragging && setIndex(i)}
                  />
                ))}
              </NavBar>
            </NavBarContainer>
          </div>
        </Modal>
      </Carousel>
    )
  );
};

export const CarouselContainer = React.memo(WrappedCarouselContainer);
