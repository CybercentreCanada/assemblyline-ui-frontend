import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  CircularProgress,
  IconButton,
  Modal,
  Skeleton,
  Theme,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Carousel from 'commons/addons/carousel/Carousel';
import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp, isEscape } from 'commons/components/utils/keyboard';
import useCarousel from 'components/hooks/useCarousel';
import useMyAPI from 'components/hooks/useMyAPI';
import { CAROUSEL_PARAM } from 'components/providers/CarouselProvider';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import CarouselThumb from './Thumb';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    backdropFilter: 'blur(2px)',
    transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;'
  },
  wrapper: {
    overflow: 'hidden',
    position: 'absolute',
    width: 'inherit',
    height: 'inherit',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: '80px',
    right: '80px',
    display: 'grid',
    placeItems: 'center'
  },
  main: {
    position: 'absolute',
    top: '50vh',
    left: '50vw',
    transform: 'translate(-50%, -50%)'
  },
  close: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: theme.spacing(2)
  },
  previous: {
    position: 'absolute',
    left: 0,
    top: '80px',
    bottom: 'min(128px, 20vw, 20vh)',
    padding: theme.spacing(2),
    display: 'grid',
    placeItems: 'center'
  },
  next: {
    position: 'absolute',
    right: 0,
    top: '80px',
    bottom: 'min(128px, 20vw, 20vh)',
    padding: theme.spacing(2),
    display: 'grid',
    placeItems: 'center'
  },
  navbar: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    gridArea: 'nav',
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto'
  },
  headerContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    rowGap: theme.spacing(0.5),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.mode === 'dark' ? 'rgb(48, 48, 48)' : '#fafafa',
    borderRadius: `0 0 ${theme.spacing(1)} ${theme.spacing(1)}`,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '&:hover > span': {
      overflowX: 'auto',
      whiteSpace: 'wrap'
    }
  },
  title: {
    fontWeight: 500
  },
  text: {
    minWidth: '10vw',
    fontWeight: 400,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  image: {
    cursor: 'pointer',
    objectFit: 'contain',
    verticalAlign: 'bottom',
    minWidth: '256px',
    imageRendering: 'pixelated',
    borderRadius: theme.spacing(1)
  },
  progress: {
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgb(48, 48, 48)' : '#fafafa',
    width: '20vw',
    maxHeight: 'calc(100vh - min(128px, 20vw, 20vh))',
    aspectRatio: `${Math.sqrt(2)}`,
    borderRadius: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      maxWidth: '100vw',
      maxHeight: 'calc(100vh - 230px)'
    }
  },
  spacer: {
    minWidth: '50vw'
  },
  button: {
    backgroundColor: theme.palette.background.default,
    opacity: 1,
    transition: theme.transitions.create('opacity', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    }),
    '&:hover': {
      backgroundColor: theme.palette.background.default,
      opacity: 0.5
    }
  },
  thumb: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgb(48, 48, 48) !important' : '#fafafa !important'
  }
}));

export const WrappedCarouselContainer = () => {
  const { t } = useTranslation('search');
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { open, images, onCloseImage, onNextImage, onPreviousImage } = useCarousel();

  const [data, setData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isSmall = useMediaQuery(
    `@media (max-width: ${theme.breakpoints.values.md}px) or (max-height: ${theme.breakpoints.values.sm}px)`
  );

  const position = useRef<any>(null);

  const currentImage = useMemo(() => {
    const query = new SimpleSearchQuery(location.search).get(CAROUSEL_PARAM, null);
    const index = images.findIndex(i => i.id === query);
    return index >= 0 ? images[index] : null;
  }, [images, location.search]);

  const handleResize = useCallback((event?: any, zoom: number = 1) => {
    const img = document.getElementById('carousel-image');
    const wrapper = document.getElementById('carousel-wrapper');

    if (!img || !wrapper) return;

    const rect = img.getBoundingClientRect();

    wrapper.style.transform = 'inherit';
    wrapper.style.width = `min(100vw, ${rect.width}px)`;
    wrapper.style.height = `min(100vh, ${rect.height}px)`;
    wrapper.style.left = `calc(50vw - min(100vw, ${rect.width}px) / 2)`;
    wrapper.style.top = `calc(50vh - min(100vh, ${rect.height}px) / 2)`;
    wrapper.style.paddingLeft = rect.width >= window.innerWidth ? '80px' : 'initial';
    wrapper.style.paddingRight = rect.width >= window.innerWidth ? '80px' : 'initial';
    wrapper.style.paddingTop = rect.height >= window.innerHeight ? '80px' : 'initial';
    wrapper.style.paddingBottom = rect.height >= window.innerHeight ? 'min(128px, 20vw, 20vh)' : 'initial';

    if (!event) return;

    const x =
      (event.clientX - event.target.offsetLeft - rect.left + (rect.width >= window.innerWidth ? 80 : 0)) / rect.width;
    const y =
      (event.clientY - event.target.offsetTop - rect.top + (rect.height >= window.innerHeight ? 80 : 0)) / rect.height;

    wrapper.scrollLeft = zoom * x * (wrapper.scrollWidth - wrapper.offsetWidth);
    wrapper.scrollTop = zoom * y * (wrapper.scrollHeight - wrapper.offsetHeight);
  }, []);

  const handleWheel = useCallback(
    (event: any) => {
      const img = document.getElementById('carousel-image');
      if (!img) return;

      const rect = img.getBoundingClientRect();

      const width = event.target.style.width;
      const zoom = width === '' ? (100 * rect.width) / window.innerWidth : parseInt(width.slice(0, -2));

      const newZoom = Math.min(Math.max(event.deltaY < 0 ? zoom + 10 : zoom - 10, 10), 500);
      event.target.style.width = `${newZoom}vw`;
      handleResize(event, newZoom / zoom);
    },
    [handleResize]
  );

  const handleMouseDown = useCallback((event: any) => {
    position.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      hasMoved: false
    };
  }, []);

  const handleMouseMove = useCallback((event: any) => {
    if (!position.current) return;
    const wrapper = document.getElementById('carousel-wrapper');
    wrapper.scrollLeft -= event.clientX - position.current.clientX;
    wrapper.scrollTop -= event.clientY - position.current.clientY;
    position.current = { clientX: event.clientX, clientY: event.clientY, hasMoved: true };
  }, []);

  const handleMouseUp = useCallback(
    (event: any) => {
      if (!position.current || position.current.hasMoved) return;
      const rect = event.target.getBoundingClientRect();
      (100 * (event.clientX - rect.x)) / rect.width > 35 ? onNextImage() : onPreviousImage();
    },
    [onNextImage, onPreviousImage]
  );

  const handleDragStart = useCallback((event: any) => {
    position.current = event.targetTouches[0];
  }, []);

  const handleDrag = useCallback((event: any) => {
    const wrapper = document.getElementById('carousel-wrapper');
    var touch = event.targetTouches[0];
    wrapper.scrollLeft -= touch.clientX - position.current.clientX;
    wrapper.scrollTop -= touch.clientY - position.current.clientY;
    position.current = touch;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;
      if (isEscape(event.key)) onCloseImage();
      if (isArrowLeft(key) || isArrowUp(key)) {
        onPreviousImage();
      } else if (isArrowRight(key) || isArrowDown(key)) {
        onNextImage();
      }
    },
    [onCloseImage, onNextImage, onPreviousImage]
  );

  useEffect(() => {
    if (!currentImage) return;
    apiCall({
      url: `/api/v4/file/image/${currentImage.img}/`,
      allowCache: true,
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false),
      onSuccess: api_data => setData(api_data.api_response),
      onFailure: () => setData(null)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]);

  useEffect(() => {
    function resize() {
      handleResize();
    }
    function mouseUp() {
      position.current = null;
    }
    function keydown(e) {
      handleKeyDown(e);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('keydown', keydown);
    };
  }, [data, handleKeyDown, handleResize]);

  useEffect(() => {
    const img = document.getElementById('carousel-image');
    if (!img) return;
    const rect = img.getBoundingClientRect();
    if (rect.width >= window.innerWidth - 160)
      img.style.width = `${(100 * (window.innerWidth - 160)) / window.innerWidth}vw`;
    handleResize();
  }, [handleResize, data]);

  return (
    <Carousel onNext={onNextImage} onPrevious={onPreviousImage}>
      <Modal open={open} onClose={onCloseImage}>
        <>
          <div className={classes.main} style={{ display: loading || !data ? 'block' : 'none' }}>
            <div
              className={classes.progress}
              children={loading ? <CircularProgress /> : <BrokenImageOutlinedIcon fontSize="large" color="primary" />}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>

          {!loading && data && (
            <div id="carousel-wrapper" className={classes.wrapper}>
              <img
                id="carousel-image"
                alt={currentImage?.name}
                className={classes.image}
                draggable={false}
                src={data}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleDragStart}
                onTouchMove={handleDrag}
                onWheel={handleWheel}
              />
            </div>
          )}

          <div className={classes.header}>
            <Typography className={classes.headerContainer} variant="subtitle2">
              <span className={classes.title}>{t('header.name')}</span>
              <span className={classes.text}>
                {loading ? <Skeleton variant="rounded" /> : !currentImage ? '' : currentImage?.name}
              </span>
              <span className={classes.title}>{t('header.description')}</span>
              <span className={classes.text}>
                {loading ? <Skeleton variant="rounded" /> : !currentImage ? '' : currentImage?.description}
              </span>
            </Typography>
          </div>

          <div className={classes.navbar}>
            <div className={classes.spacer} />
            {images.map((image, i) => (
              <CarouselThumb key={i} classes={{ button: classes.thumb }} image={image} carousel />
            ))}
            <div className={classes.spacer} />
          </div>

          <div className={classes.close} onClick={onCloseImage}>
            <IconButton className={classes.button} size={isSmall ? 'small' : 'large'} children={<CloseIcon />} />
          </div>

          <div className={classes.previous} onClick={onPreviousImage}>
            <IconButton
              className={classes.button}
              size={isSmall ? 'small' : 'large'}
              children={<ArrowBackIosNewIcon />}
            />
          </div>

          <div className={classes.next} onClick={onNextImage}>
            <IconButton
              className={classes.button}
              size={isSmall ? 'small' : 'large'}
              children={<ArrowForwardIosIcon />}
            />
          </div>
        </>
      </Modal>
    </Carousel>
  );
};

export const CarouselContainer = React.memo(WrappedCarouselContainer);
export default CarouselContainer;
