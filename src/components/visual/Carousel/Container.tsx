import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import {
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Modal,
  Skeleton,
  Theme,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import Carousel from 'commons/addons/carousel/Carousel';
import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp, isEscape } from 'commons/components/utils/keyboard';
import useCarousel from 'components/hooks/useCarousel';
import useMyAPI from 'components/hooks/useMyAPI';
import { CAROUSEL_PARAM, Image } from 'components/providers/CarouselProvider';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import CarouselThumb from './Thumb';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    backdropFilter: 'blur(2px)',
    transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;'
  },
  close: {
    position: 'fixed',
    right: 0,
    top: 0,
    padding: theme.spacing(2)
  },
  navigation: {
    position: 'fixed',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    top: '95px',
    width: '80px',
    bottom: 'min(148px, 20vw, 20vh)',
    padding: theme.spacing(2),
    '&:hover > .MuiButtonBase-root': {
      backgroundColor: theme.palette.background.default,
      opacity: 0.5
    }
  },
  navigationSmall: {
    width: '66px'
  },
  previous: {
    left: 0
  },
  next: {
    right: 0
  },
  navbar: {
    position: 'fixed',
    width: '100%',
    bottom: 0,
    gridArea: 'nav',
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto'
  },
  menu: {
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    top: 0,
    left: '80px',
    right: '80px'
  },
  menuSmall: {
    left: '66px',
    right: '66px'
  },
  menuWrapper: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgb(48, 48, 48)' : '#fafafa',
    borderRadius: `0 0 ${theme.spacing(1)} ${theme.spacing(1)}`,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '&:hover span': {
      overflowX: 'auto',
      whiteSpace: 'wrap'
    }
  },
  menuDetails: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    rowGap: theme.spacing(0.5),
    padding: theme.spacing(1)
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
  imageWrapper: {
    overflowX: 'auto',
    overflowY: 'auto',
    position: 'fixed',
    width: 'inherit',
    height: 'inherit',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  image: {
    cursor: 'pointer',
    objectFit: 'contain',
    verticalAlign: 'bottom',
    minWidth: '256px',
    imageRendering: 'pixelated'
  },
  progressWrapper: {
    position: 'fixed',
    top: '50vh',
    left: '50vw',
    transform: 'translate(-50%, -50%)'
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
    backgroundColor: 'rgb(48, 48, 48) !important'
  },
  checkbox: {
    padding: '5px',
    width: '32px'
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
  const [showAll, setShowAll] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [actualZoom, setActualZoom] = useState<number>(100);

  const deferredData = useDeferredValue(data);
  const deferredZoom = useDeferredValue(zoom);

  const zoomRef = useRef<number>(100);
  const isSmallRef = useRef<boolean>(false);
  const showAllRef = useRef<boolean>(false);

  showAllRef.current = showAll;

  const isSmall = useMediaQuery(
    `@media (max-width: ${theme.breakpoints.values.md}px) or (max-height: ${theme.breakpoints.values.sm}px)`
  );

  isSmallRef.current = isSmall;

  const currentImage = useMemo<Image>(() => {
    const query = new SimpleSearchQuery(location.search).get(CAROUSEL_PARAM, null);
    const index = images.findIndex(i => i.id === query);
    return index >= 0 ? images[index] : null;
  }, [images, location.search]);

  const handleResize = useCallback(() => {
    const img = document.getElementById('carousel-image') as HTMLImageElement;
    const wrapper = document.getElementById('carousel-wrapper') as HTMLDivElement;
    const navbar = document.getElementById('carousel-navbar') as HTMLDivElement;

    if (!img || !wrapper || !navbar) return;

    const width = Math.max(256, (zoomRef.current * img.naturalWidth) / 100);
    const height = Math.max(256, (zoomRef.current * img.naturalHeight) / 100);
    const scrollbar = navbar.offsetHeight - navbar.clientHeight + 1;
    const button = isSmallRef.current ? 66 : 80;
    const menu = 95;
    const navbarHeight = `calc(min(128px, 20vw, 20vh) + ${scrollbar}px)`;

    img.style.width = `${(100 * width) / window.innerWidth}vw`;
    setActualZoom(Math.floor((100 * width) / img.naturalWidth));

    wrapper.style.opacity = '1';
    wrapper.style.width = `min(100vw - ${2 * button}px, ${width + scrollbar}px)`;
    wrapper.style.height = `min(100vh - ${menu}px - ${navbarHeight}, ${height + scrollbar}px)`;
    wrapper.style.top = `calc(${menu}px + ((100vh - ${menu}px - ${navbarHeight}) / 2)`;
  }, []);

  const handleClick = useCallback(
    (event: any) => {
      const rect = event.target.getBoundingClientRect();
      (100 * (event.clientX - rect.x)) / rect.width > 35
        ? onNextImage(!showAllRef.current)
        : onPreviousImage(!showAllRef.current);
    },
    [onNextImage, onPreviousImage]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;
      if (isEscape(event.key)) onCloseImage();
      if (isArrowLeft(key) || isArrowUp(key)) {
        onPreviousImage(!showAllRef.current);
      } else if (isArrowRight(key) || isArrowDown(key)) {
        onNextImage(!showAllRef.current);
      }
    },
    [onCloseImage, onNextImage, onPreviousImage]
  );

  const handleZoomChange = useCallback(
    (value: number) => (event: any) => {
      zoomRef.current = Math.min(Math.max(value, 10), 500);
      setZoom(value);
    },
    []
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
    function keydown(e) {
      handleKeyDown(e);
    }
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', keydown);
      setData(null);
      setZoom(100);
      zoomRef.current = 100;
    };
  }, [handleKeyDown, handleResize]);

  useEffect(() => {
    const wrapper = document.getElementById('carousel-wrapper') as HTMLDivElement;
    if (wrapper) wrapper.style.opacity = '0';
  }, [data]);

  useEffect(() => {
    handleResize();
  }, [deferredZoom, deferredData, handleResize]);

  return (
    <Carousel onNext={onNextImage} onPrevious={onPreviousImage}>
      <Modal className={classes.backdrop} open={open} onClose={onCloseImage}>
        <>
          <div
            id="carousel-loading"
            className={classes.progressWrapper}
            style={{ display: loading || !data ? 'block' : 'none' }}
          >
            <div
              className={classes.progress}
              children={loading ? <CircularProgress /> : <BrokenImageOutlinedIcon fontSize="large" color="primary" />}
              onClick={handleClick}
            />
          </div>

          {!loading && !!deferredData && (
            <div id="carousel-wrapper" className={classes.imageWrapper}>
              <img
                id="carousel-image"
                alt={currentImage?.name}
                className={classes.image}
                draggable={false}
                src={deferredData}
                onClick={handleClick}
              />
            </div>
          )}

          <div className={clsx(classes.menu, isSmall && classes.menuSmall)} onClick={onCloseImage}>
            <div
              className={classes.menuWrapper}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className={classes.flex} style={{ gap: theme.spacing(2) }}>
                <div className={classes.flex} style={{ gap: theme.spacing(0.5) }}>
                  <IconButton
                    size="small"
                    sx={{ width: '30px' }}
                    disabled={actualZoom < 10 || actualZoom > 500}
                    onClick={handleZoomChange(actualZoom - 10)}
                    children={<RemoveOutlinedIcon fontSize="inherit" />}
                  />
                  <Typography
                    variant="subtitle2"
                    color={
                      actualZoom < 10 || actualZoom > 500 ? theme.palette.text.disabled : theme.palette.text.primary
                    }
                    children={`${actualZoom}%`}
                  />
                  <IconButton
                    size="small"
                    sx={{ width: '30px' }}
                    disabled={actualZoom < 10 || actualZoom > 500}
                    onClick={handleZoomChange(actualZoom + 10)}
                    children={<AddOutlinedIcon fontSize="inherit" />}
                  />
                </div>
                <FormControlLabel
                  control={
                    <Checkbox
                      classes={{ root: classes.checkbox }}
                      size="small"
                      checked={showAll}
                      onClick={() => setShowAll(v => !v)}
                    />
                  }
                  label={<Typography variant="subtitle2" children={t('showAll')} />}
                />
              </div>
              <Divider />
              <Typography className={classes.menuDetails} variant="subtitle2">
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
          </div>

          <div id="carousel-navbar" className={classes.navbar}>
            <div className={classes.spacer} />
            {images
              .filter(i => showAll || (currentImage && i.group === currentImage.group))
              .map((image, i) => (
                <CarouselThumb key={i} classes={{ button: classes.thumb }} image={image} carousel />
              ))}
            <div className={classes.spacer} />
          </div>

          <div className={classes.close} onClick={onCloseImage}>
            <IconButton className={classes.button} size={isSmall ? 'small' : 'large'} children={<CloseIcon />} />
          </div>

          <div
            className={clsx(classes.navigation, isSmall && classes.navigationSmall, classes.previous)}
            color="inherit"
            onClick={() => onPreviousImage(!showAllRef.current)}
            children={
              <IconButton
                className={classes.button}
                size={isSmall ? 'small' : 'large'}
                children={<ArrowBackIosNewIcon />}
              />
            }
          />

          <div
            className={clsx(classes.navigation, isSmall && classes.navigationSmall, classes.next)}
            color="inherit"
            onClick={() => onNextImage(!showAllRef.current)}
            children={
              <IconButton
                className={classes.button}
                size={isSmall ? 'small' : 'large'}
                children={<ArrowForwardIosIcon />}
              />
            }
          />
        </>
      </Modal>
    </Carousel>
  );
};

export const CarouselContainer = React.memo(WrappedCarouselContainer);
export default CarouselContainer;
