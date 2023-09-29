import AddIcon from '@mui/icons-material/Add';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { alpha, CircularProgress, IconButton, Modal, Skeleton, Slider, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import Carousel from 'commons/addons/carousel/Carousel';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CarouselItem from './Item';

const ZOOM_CLASS = 'zooming';

const useStyles = makeStyles(theme => {
  const navbarHeight = 'min(128px, 30vw, 30vh)';

  // const isSmall = `@media (max-width: ${theme.breakpoints.values.md}px) or (max-height: ${theme.breakpoints.values.sm}px)`;

  const augmentedPaper = theme.palette.augmentColor({ color: { main: theme.palette.background.paper } })[
    theme.palette.mode === 'dark' ? 'light' : 'dark'
  ];

  const options = {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  };

  return {
    backdrop: {
      outline: 'none',
      backdropFilter: 'blur(2px)',
      transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
      zIndex: 1350,
      '&:focus-visible': {
        outline: 'none'
      }
    },
    root: {
      height: '100%',
      width: '100%',
      outline: 'none'
    },
    menu: {
      position: 'absolute',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'start',
      justifyItems: 'center'
    },
    menuPane: {
      display: 'grid',
      placeItems: 'center',
      borderRadius: '0px 0px 4px 4px',
      padding: theme.spacing(1),
      backgroundColor: alpha(theme.palette.background.paper, 0.5),
      minWidth: '10vw',
      [`&.${ZOOM_CLASS}`]: {
        minWidth: 'auto',
        maxWidth: '350px',
        width: '100%'
      }
    },
    info: {
      display: 'grid',
      alignContent: 'end',
      alignItems: 'stretch',
      gridTemplateColumns: 'auto 1fr',
      columnGap: theme.spacing(1),
      transition: theme.transitions.create(['all'], options),
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
    },
    buttonWrapper: {
      cursor: 'pointer',
      padding: theme.spacing(1),
      backgroundColor: 'rgba(0,0,0,0)',
      transition: theme.transitions.create('background-color', options),
      '&:hover>button': {
        backgroundColor: alpha(augmentedPaper, 0.5)
      },
      '&:hover>div>button': {
        backgroundColor: alpha(augmentedPaper, 0.5)
      }
    },
    button: {
      color: theme.palette.text.primary,
      backgroundColor: alpha(theme.palette.background.paper, 0.5)
    },
    navButton: {
      position: 'absolute',
      top: '50%',
      bottom: '50%',
      display: 'none',
      cursor: 'pointer',
      height: '48px',
      width: '48px',
      color: theme.palette.text.primary,
      backgroundColor: alpha(theme.palette.background.paper, 0.5),
      '&:hover': {
        backgroundColor: alpha(augmentedPaper, 0.5)
      }
    },
    navbarContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: navbarHeight,
      overflow: 'scroll',
      userSelect: 'none',
      scrollbarWidth: 'none', // Firefox
      '-ms-overflow-style': 'none', // Internet Explorer 10+
      '&::-webkit-scrollbar': {
        display: 'none' // Safari and Chrome
      },
      transition: theme.transitions.create(['all'], options),
      [`&.${ZOOM_CLASS}`]: {
        bottom: `calc(0px - ${navbarHeight})`
      }
    },
    navbar: {
      height: '100%',
      width: 'fit-content',
      minWidth: '100%',
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing(1),
      padding: theme.spacing(1)
    },
    imageContainer: {
      position: 'absolute',
      width: '100%',
      top: '64px',
      bottom: navbarHeight,
      display: 'grid',
      placeItems: 'center',
      overflow: 'scroll',
      userSelect: 'none',
      scrollbarWidth: 'none', // Firefox
      '-ms-overflow-style': 'none', // Internet Explorer 10+
      '&::-webkit-scrollbar': {
        display: 'none' // Safari and Chrome
      },
      transition: theme.transitions.create(['all'], options),
      [`&.${ZOOM_CLASS}`]: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    },
    containerNavOverlay: {
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
    },
    image: {
      height: 'auto',
      width: 'auto',
      minHeight: navbarHeight,
      minWidth: navbarHeight,
      maxWidth: '100vw',
      maxHeight: `calc(100vh - 64px - ${navbarHeight})`,
      imageRendering: 'pixelated',
      transition: theme.transitions.create(['all'], options),
      [`&.${ZOOM_CLASS}`]: {
        maxHeight: 'none',
        maxWidth: 'none'
      }
    },
    loadingContainer: {
      height: `calc(2 * ${navbarHeight})`,
      aspectRatio: '4 / 3',
      display: 'grid',
      placeItems: 'center',
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.background.paper,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundBlendMode: 'soft-light',
      imageRendering: 'unset',
      overflow: 'hidden'
    },
    zoom: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
      gap: theme.spacing(1),
      '@media (max-width: 440px)': {
        flexWrap: 'wrap',
        '&>span': {
          display: 'none'
        }
      }
    },
    zoomSlider: {
      '& .MuiSlider-thumb': {
        boxShadow: 'none'
      }
    }
  };
});

export type Image = {
  name: string;
  description: string;
  img: string;
  thumb: string;
};

type Dragging = {
  isDown: boolean;
  isDragging?: boolean;
  scrollLeft?: Number;
  scrollTop?: Number;
  startX?: number;
  startY?: number;
};

type CarouselContainerProps = {
  images: Image[];
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
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const [thumbData, setThumbData] = useState<string>(null);
  const [imgData, setImgData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);

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

  const currentImage = useMemo<Image>(() => images && images[index], [images, index]);

  const zoomClass = useMemo<string | null>(() => isZooming && ZOOM_CLASS, [isZooming]);

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

  const handleImageDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    imageDrag.current = {
      isDown: true,
      startX: event.pageX - containerRef.current.offsetLeft,
      startY: event.pageY - containerRef.current.offsetTop,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    };
  }, []);

  const handleImageStop = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    imageDrag.current = {
      isDown: false,
      scrollLeft: 0,
      scrollTop: 0,
      startX: 0,
      startY: 0
    };
  }, []);

  const handleImageMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

  const handleZoomChange = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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

  return (
    images &&
    images.length > 0 && (
      <Carousel onPrevious={handleImageChange(-1)} onNext={handleImageChange(1)}>
        <Modal className={classes.backdrop} open={open} onClose={handleClose}>
          <div id="carousel" className={classes.root}>
            <div
              ref={containerRef}
              className={clsx(classes.imageContainer, zoomClass)}
              onClick={!isZooming ? handleClose : null}
              onMouseDown={handleImageDown}
              onMouseUp={handleImageStop}
              onMouseMove={handleImageMove}
            >
              <div
                className={clsx(classes.containerNavOverlay, zoomClass)}
                onClick={handleImageChange(-1)}
                style={{ left: 0 }}
              >
                <Tooltip title={t('prev')} placement="top">
                  <IconButton
                    className={clsx(classes.navButton, zoomClass)}
                    component="div"
                    size="large"
                    children={<ChevronLeftOutlinedIcon />}
                    onClick={handleImageChange(1)}
                    style={{ left: '8px' }}
                  />
                </Tooltip>
              </div>

              {imgData ? (
                <img
                  ref={imgRef}
                  className={clsx(classes.image, zoomClass)}
                  src={imgData}
                  alt={currentImage?.name}
                  draggable={false}
                  style={
                    isZooming
                      ? {
                          width: `calc(${zoom / 100} * ${imgRef.current.naturalWidth}px)`,
                          height: `calc(${zoom / 100} * ${imgRef.current.naturalHeight}px)`
                        }
                      : {}
                  }
                  onClick={handleZoomClick}
                />
              ) : (
                <div className={classes.loadingContainer} style={thumbData && { backgroundImage: `url(${thumbData})` }}>
                  {loading ? (
                    <CircularProgress color="primary" />
                  ) : (
                    <BrokenImageOutlinedIcon color="primary" fontSize="large" />
                  )}
                </div>
              )}

              <div
                className={clsx(classes.containerNavOverlay, zoomClass)}
                onClick={handleImageChange(1)}
                style={{ right: '0' }}
              >
                <Tooltip title={t('next')} placement="top">
                  <IconButton
                    className={clsx(classes.navButton, zoomClass)}
                    component="div"
                    size="large"
                    children={<ChevronRightOutlinedIcon />}
                    onClick={handleImageChange(1)}
                    style={{ right: '8px' }}
                  />
                </Tooltip>
              </div>
            </div>

            <div id="carousel-menu" className={classes.menu}>
              <div className={classes.buttonWrapper} onClick={handleClose}>
                <Tooltip title={t('close')}>
                  <IconButton className={classes.button} size="large" children={<CloseIcon />} />
                </Tooltip>
              </div>

              <div className={clsx(classes.menuPane, zoomClass)}>
                {isZooming ? (
                  <div className={classes.zoom}>
                    <div style={{ textAlign: 'end', minWidth: '35px' }}>{`${zoom}%`}</div>
                    <IconButton
                      size="small"
                      onClick={() => setZoom(z => Math.max(10, z - 10))}
                      children={<RemoveIcon fontSize="small" />}
                    />
                    <Slider
                      className={classes.zoomSlider}
                      value={zoom}
                      step={10}
                      min={10}
                      max={500}
                      size="small"
                      onChange={(event, newValue) => setZoom(newValue as number)}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setZoom(z => Math.min(500, z + 10))}
                      children={<AddIcon fontSize="small" />}
                    />
                  </div>
                ) : (
                  <div className={classes.info}>
                    <div>{t('name')}</div>
                    <div>{currentImage ? currentImage?.name : loading && <Skeleton variant="rounded" />}</div>
                    <div>{t('description')}</div>
                    <div>{currentImage ? currentImage?.description : loading && <Skeleton variant="rounded" />}</div>
                  </div>
                )}
              </div>

              <div className={classes.buttonWrapper} onClick={imgData && handleZoomChange}>
                <Tooltip title={t('zoom')}>
                  <div>
                    <IconButton
                      className={classes.button}
                      size="large"
                      disabled={!imgData}
                      children={isZooming ? <ZoomOutIcon /> : <ZoomInIcon />}
                    />
                  </div>
                </Tooltip>
              </div>
            </div>

            <div
              id="carousel-navbar"
              ref={navbarRef}
              className={clsx(classes.navbarContainer, zoomClass)}
              onMouseDown={handleNavbarDown}
              onMouseLeave={handleNavbarStop}
              onMouseUp={handleNavbarStop}
              onMouseMove={handleNavbarMove}
            >
              <div className={clsx(classes.navbar)}>
                {images.map((image, i) => (
                  <CarouselItem
                    key={'thumb-' + i}
                    alt={image.name}
                    src={image.thumb}
                    selected={index === i}
                    onClick={() => !navbarScroll.current.isDragging && setIndex(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </Carousel>
    )
  );
};

export const CarouselContainer = React.memo(WrappedCarouselContainer);
