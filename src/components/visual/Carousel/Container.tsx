import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
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
import clsx from 'clsx';
import Carousel from 'commons/addons/carousel/Carousel';
import useMyAPI from 'components/hooks/useMyAPI';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { CarouselThumb, CAROUSEL_PARAM, useCarousel } from '.';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    backdropFilter: 'blur(2px)',
    transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;'
  },
  root: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateAreas: `"close close close"
                        "left main right"
                        "nav nav nav"`
  },
  main: {
    gridArea: 'main',
    placeSelf: 'center'
  },
  close: {
    gridArea: 'close',
    placeSelf: 'end',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1)
    }
  },
  left: {
    gridArea: 'left',
    display: 'grid',
    placeItems: 'center',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  right: {
    gridArea: 'right',
    display: 'grid',
    placeItems: 'center',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  navbar: {
    gridArea: 'nav',
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    alignItems: 'center'
  },
  header: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    rowGap: theme.spacing(0.5),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white,
    borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`
  },
  title: {
    fontWeight: 500
  },
  text: {
    fontWeight: 400,
    [theme.breakpoints.down('md')]: {
      overflowX: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    },
    '@media (max-height: 960px)': {
      overflowX: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }
  },
  hero: {
    display: 'grid',
    borderRadius: `0 0 ${theme.spacing(1)} ${theme.spacing(1)}`,
    padding: `0 0 ${theme.spacing(1)} 0`,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white
  },
  heroButton: {
    padding: 0
  },
  image: {
    maxWidth: '100%',
    objectFit: 'contain',
    maxHeight: 'calc(100vh - 260px)',
    [theme.breakpoints.down('md')]: {
      maxHeight: 'calc(100vh - 230px)'
    }
  },
  progress: {
    width: '100vw',
    maxWidth: '50vw',
    maxHeight: 'calc(100vh - 260px)',
    aspectRatio: `${Math.sqrt(2)}`,
    display: 'grid',
    placeItems: 'center',
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
  const [width, setWidth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isDownMD = useMediaQuery(theme.breakpoints.down('md'));

  const currentImage = useMemo(() => {
    const query = new SimpleSearchQuery(location.search).get(CAROUSEL_PARAM, null);
    const index = images.findIndex(i => i.id === query);
    return index >= 0 ? images[index] : null;
  }, [images, location.search]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const clientX = event.clientX;
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      (100 * (clientX - rect.x)) / rect.width > 35 ? onNextImage() : onPreviousImage();
    },
    [onNextImage, onPreviousImage]
  );

  useEffect(() => {
    setTimeout(() => {
      const w = document.getElementById('hero-image')?.getBoundingClientRect().width;
      setWidth(w > 0 ? w : 'auto');
    }, 1);
  }, [data]);

  useEffect(() => {
    function resize() {
      setWidth(document.getElementById('hero-image')?.getBoundingClientRect().width);
    }
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

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

  return (
    <Carousel onNext={onNextImage} onPrevious={onPreviousImage}>
      <Modal className={clsx(classes.root, classes.backdrop)} open={open} onClose={onCloseImage}>
        <>
          {currentImage && (
            <div className={classes.main}>
              <Typography className={classes.header} variant="subtitle2" style={{ maxWidth: width }}>
                <span className={classes.title}>{t('header.name')}</span>
                {loading && <Skeleton variant="rounded" height="100%" width="100%" />}
                {!loading && currentImage && <span className={classes.text}>{currentImage.name}</span>}
                <span className={classes.title}>{t('header.description')}</span>
                {loading && <Skeleton variant="rounded" height="100%" width="100%" />}
                {!loading && currentImage && <span className={classes.text}>{currentImage.description}</span>}
              </Typography>
              <div className={classes.hero}>
                <Button className={classes.heroButton} onClick={handleClick}>
                  {loading ? (
                    <div className={classes.progress} children={<CircularProgress />} />
                  ) : !data ? (
                    <div className={classes.progress} children={<BrokenImageOutlinedIcon fontSize="large" />} />
                  ) : (
                    <img id="hero-image" className={classes.image} src={data} alt={currentImage.name} />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className={classes.navbar}>
            <div className={classes.spacer} />
            {images.map((image, i) => (
              <CarouselThumb key={i} image={image} carousel />
            ))}
            <div className={classes.spacer} />
          </div>

          <div className={classes.close} onClick={onCloseImage}>
            <IconButton className={classes.button} size={isDownMD ? 'small' : 'large'} children={<CloseIcon />} />
          </div>
          <div className={classes.left} onClick={onPreviousImage}>
            <IconButton className={classes.button} size="large" children={<ArrowBackIosNewIcon />} />
          </div>
          <div className={classes.right} onClick={onNextImage}>
            <IconButton className={classes.button} size="large" children={<ArrowForwardIosIcon />} />
          </div>
        </>
      </Modal>
    </Carousel>
  );
};

export const CarouselContainer = React.memo(WrappedCarouselContainer);
export default CarouselContainer;
