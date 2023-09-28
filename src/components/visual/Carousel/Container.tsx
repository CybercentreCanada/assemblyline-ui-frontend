import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { alpha, CircularProgress, IconButton, Modal, Skeleton, Tooltip } from '@mui/material';
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
    info: {
      borderRadius: '0px 0px 4px 4px',
      display: 'grid',
      alignContent: 'end',
      alignItems: 'stretch',
      gridTemplateColumns: 'auto 1fr',
      padding: theme.spacing(1),
      columnGap: theme.spacing(1),
      minWidth: '10vw',
      opacity: 1,
      backgroundColor: alpha(theme.palette.background.paper, 0.5),
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
      },
      [`&.${ZOOM_CLASS}`]: {
        opacity: 0
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
    imageWrapper: {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      [`&.${ZOOM_CLASS}`]: {
        position: 'initial'
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
        minHeight: 'max(256px, 200%)',
        minWidth: 'max(256px, 200%)',
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
  isDragging: boolean;
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

  const navbarRef = useRef<HTMLDivElement>(null);
  const navbarScroll = useRef<Dragging>({ isDown: false, isDragging: false, scrollLeft: 0, startX: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const imageScroll = useRef<Dragging>({
    isDown: false,
    isDragging: false,
    scrollLeft: 0,
    scrollTop: 0,
    startX: 0,
    startY: 0
  });

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

  const handleZoomClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setIsZooming(z => !z);
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
            <div className={clsx(classes.imageContainer, zoomClass)} onClick={!isZooming ? handleClose : null}>
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
              <div
                className={clsx(classes.imageWrapper, zoomClass)}
                onClick={event => event.stopPropagation()}
                onDoubleClick={handleZoomClick}
              >
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
              <div className={clsx(classes.info, zoomClass)}>
                <div>{t('name')}</div>
                <div>{currentImage ? currentImage?.name : loading && <Skeleton variant="rounded" />}</div>
                <div>{t('description')}</div>
                <div>{currentImage ? currentImage?.description : loading && <Skeleton variant="rounded" />}</div>
              </div>
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
