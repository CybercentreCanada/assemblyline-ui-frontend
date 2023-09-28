import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { alpha, Button, CircularProgress, IconButton, Modal, Paper, Skeleton, Tooltip, useTheme } from '@mui/material';
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
      // backgroundColor: 'transparent',
      backdropFilter: 'blur(2px)',
      transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
      zIndex: 1350
    },
    root: {
      height: '100%',
      width: '100%'
    },
    menu: {
      position: 'absolute',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'start',
      justifyItems: 'center'
    },
    info: {
      borderRadius: '0px 0px 4px 4px',
      display: 'grid',
      alignContent: 'end',
      alignItems: 'stretch',
      gridTemplateColumns: 'auto 1fr',
      padding: theme.spacing(1),
      columnGap: theme.spacing(1),
      minWidth: '10vw',
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
        backgroundColor: augmentedPaper
      },
      '&:hover>div>button': {
        backgroundColor: augmentedPaper
      }
    },
    button: {
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.paper
    },
    navButton: {
      position: 'absolute',
      top: '64px',
      bottom: navbarHeight,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      padding: theme.spacing(1),
      backgroundColor: 'rgba(0,0,0,0)',
      '&:hover': {
        backgroundColor: alpha(augmentedPaper, 0.1)
      },
      '&:hover>div': {
        backgroundColor: augmentedPaper
      }
    },
    navPrev: {
      left: 0,
      borderRadius: `0 ${theme.spacing(0.5)} ${theme.spacing(0.5)} 0`,
      transition: theme.transitions.create(['all'], options),
      [`&.${ZOOM_CLASS}`]: {
        left: '-64px'
      }
    },
    navNext: {
      right: 0,
      borderRadius: `${theme.spacing(0.5)} 0 0 ${theme.spacing(0.5)}`,
      transition: theme.transitions.create(['all'], options),
      [`&.${ZOOM_CLASS}`]: {
        right: '-64px'
      }
    },
    navIcon: {
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.paper
    },
    navActive: {
      backgroundColor: alpha(augmentedPaper, 0.1),
      '&>div': {
        backgroundColor: augmentedPaper
      }
    },
    navbarContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: navbarHeight,
      overflow: 'scroll',
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
    imageWrapper: {
      position: 'absolute',
      display: 'grid',
      [`&.${ZOOM_CLASS}`]: {
        position: 'initial',
        display: 'unset'
      }
    },
    imageOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'space-between'
    },
    imageOverlayItem: {
      width: '20%',
      cursor: 'pointer',
      [`&.${ZOOM_CLASS}`]: {
        width: '0%'
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
        minHeight: '100vh',
        minWidth: '100vw',
        maxHeight: 'none',
        maxWidth: 'none',
        marginTop: '64px'
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
    }
  };
});

export type Image = {
  name: string;
  description: string;
  img: string;
  thumb: string;
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
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const [thumbData, setThumbData] = useState<string>(null);
  const [imgData, setImgData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const zoomTimer = useRef<number>(null);
  const navbarScroll = useRef<{ isDown: boolean; isDragging: boolean; scrollLeft: Number; startX: number }>({
    isDown: false,
    isDragging: false,
    scrollLeft: 0,
    startX: 0
  });

  const currentImage = useMemo<Image>(() => images && images[index], [images, index]);

  const zoomClass = useMemo<string | null>(() => isZooming && ZOOM_CLASS, [isZooming]);

  // const isSmall = useMediaQuery(
  //   `@media (max-width: ${theme.breakpoints.values.md}px) or (max-height: ${theme.breakpoints.values.sm}px)`
  // );

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
        if (!images && images.length <= 1) return;
        setIndex(i => (i + value + images.length) % images.length);
      },
    [images, setIndex]
  );

  const handleNavbarDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    navbarScroll.current = {
      isDown: true,
      isDragging: false,
      startX: event.pageX - navbarRef.current.offsetLeft,
      scrollLeft: navbarRef.current.scrollLeft
    };
  }, []);

  const handleNavbarStop = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    navbarScroll.current = { isDown: false, isDragging: false, scrollLeft: 0, startX: 0 };
  }, []);

  const handleNavbarMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!navbarScroll.current.isDown) return;
    event.preventDefault();
    const x = event.pageX - navbarRef.current.offsetLeft;
    const walkX = x - navbarScroll.current.startX;
    navbarRef.current.scrollLeft = navbarScroll.current.scrollLeft.valueOf() - walkX;
    navbarScroll.current.isDragging = Math.abs(walkX) > 20;
  }, []);

  const handleImagePointerEnter = useCallback(
    (type: 'prev' | 'next') => (event: React.PointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      type === 'prev'
        ? prevRef.current?.classList.add(classes.navActive)
        : nextRef.current?.classList.add(classes.navActive);
    },
    [classes.navActive]
  );

  const handleImagePointerLeave = useCallback(
    (type: 'prev' | 'next') => (event: React.PointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      type === 'prev'
        ? prevRef.current?.classList.remove(classes.navActive)
        : nextRef.current?.classList.remove(classes.navActive);
    },
    [classes.navActive]
  );

  const handleZoomClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    const now = Date.now();
    if (now - zoomTimer.current < 200) setIsZooming(z => !z);
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
            <div className={clsx(classes.imageContainer, zoomClass)} onClick={handleClose}>
              <div className={clsx(classes.imageWrapper, zoomClass)}>
                <div className={clsx(classes.imageOverlay, zoomClass)} onClick={e => e.stopPropagation()}>
                  <div
                    className={clsx(classes.imageOverlayItem, zoomClass)}
                    onPointerEnter={handleImagePointerEnter('prev')}
                    onPointerLeave={handleImagePointerLeave('prev')}
                    onClick={handleImageChange(-1)}
                  />
                  <div style={{ width: '100%' }} onClick={handleZoomClick} />
                  <div
                    className={clsx(classes.imageOverlayItem, zoomClass)}
                    onPointerEnter={handleImagePointerEnter('next')}
                    onPointerLeave={handleImagePointerLeave('next')}
                    onClick={handleImageChange(1)}
                  />
                </div>

                {imgData ? (
                  <img
                    className={clsx(classes.image, zoomClass)}
                    src={imgData}
                    alt={currentImage?.name}
                    draggable={false}
                  />
                ) : (
                  <div
                    className={classes.loadingContainer}
                    style={thumbData && { backgroundImage: `url(${thumbData})` }}
                  >
                    {loading ? (
                      <CircularProgress color="primary" />
                    ) : (
                      <BrokenImageOutlinedIcon color="primary" fontSize="large" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div id="carousel-menu" className={clsx(classes.menu)}>
              <div className={classes.buttonWrapper} onClick={handleClose}>
                <Tooltip title={t('close')}>
                  <IconButton className={classes.button} size="large" children={<CloseIcon />} />
                </Tooltip>
              </div>
              <Paper className={classes.info}>
                <div>{t('name')}</div>
                <div>{currentImage ? currentImage?.name : loading && <Skeleton variant="rounded" />}</div>
                <div>{t('description')}</div>
                <div>{currentImage ? currentImage?.description : loading && <Skeleton variant="rounded" />}</div>
              </Paper>
              <div className={classes.buttonWrapper} onClick={() => imgData && setIsZooming(z => !z)}>
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

            <Button
              className={clsx(classes.navButton, classes.navPrev, zoomClass)}
              ref={prevRef}
              size="large"
              onClick={handleImageChange(-1)}
            >
              <Tooltip title={t('prev')}>
                <IconButton
                  className={classes.navIcon}
                  component="div"
                  size="large"
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  children={<ChevronLeftOutlinedIcon />}
                />
              </Tooltip>
            </Button>

            <Button
              className={clsx(classes.navButton, classes.navNext, zoomClass)}
              ref={nextRef}
              size="large"
              onClick={handleImageChange(1)}
            >
              <Tooltip title={t('next')}>
                <IconButton
                  className={classes.navIcon}
                  component="div"
                  size="large"
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  children={<ChevronRightOutlinedIcon />}
                />
              </Tooltip>
            </Button>

            <div
              id="carousel-navbar"
              ref={navbarRef}
              className={clsx(classes.navbarContainer, zoomClass)}
              onPointerDown={handleNavbarDown}
              onPointerLeave={handleNavbarStop}
              onPointerUp={handleNavbarStop}
              onPointerMove={handleNavbarMove}
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
