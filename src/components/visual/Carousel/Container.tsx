import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Button, CircularProgress, IconButton, Modal, Skeleton, Theme, Typography } from '@mui/material';
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
  backdrop: {},
  root: {
    backdropFilter: 'blur(2px)',
    transition: 'opacity backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
    height: '100vh',
    width: '100vw',
    display: 'grid',
    gridTemplateAreas: `"close close close"
                        "left main right"
                        "nav nav nav"`,
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateColumns: 'auto 1fr auto'

    // [theme.breakpoints.only('xs')]: {
    //   gridTemplateAreas: `"_ _ close"
    //                       "main main main"
    //                       "nav nav nav"`
    // }
  },
  main: {
    placeSelf: 'center',
    gridArea: 'main'
  },
  content: {
    display: 'grid',
    borderRadius: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white,
    width: 'min(100%, auto)',
    height: 'min(100%, auto)'
  },
  navbar: {
    gridArea: 'nav',
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    alignItems: 'center'
  },
  left: {
    gridArea: 'left'
  },
  right: {
    gridArea: 'right'
  },
  close: {
    gridArea: 'close'
  },
  header: {
    display: 'grid',

    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    rowGap: theme.spacing(0.5),
    margin: theme.spacing(1)
  },
  button: {
    padding: 0
  },
  image: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain'
  },
  progress: {
    width: '50vw',
    aspectRatio: `${Math.sqrt(2)}`
  },
  spacer: {
    minWidth: '50vw',
    boxSizing: 'border-box',
    flexGrow: 0
  },
  center: {
    display: 'grid',
    placeItems: 'center'
  },
  action: {
    margin: theme.spacing(2)
  }
}));

export const WrappedCarouselContainer = () => {
  const { t } = useTranslation('search');
  const classes = useStyles();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { open, images, onCloseImage, onNextImage, onPreviousImage } = useCarousel();

  const [data, setData] = useState<string>('asd');
  const [width, setWidth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      <Modal className={classes.root} open={open} onClose={onCloseImage}>
        <>
          {currentImage && (
            <div className={clsx(classes.center, classes.main)}>
              <div className={classes.content} style={{ maxWidth: width }}>
                <Typography className={classes.header} variant="subtitle2">
                  <span style={{ fontWeight: 500 }}>{t('header.name')}</span>
                  {loading && <Skeleton variant="rounded" height="100%" width="100%" />}
                  {!loading && currentImage && <span style={{ fontWeight: 400 }}>{currentImage.name}</span>}
                  <span style={{ fontWeight: 500 }}>{t('header.description')}</span>
                  {loading && <Skeleton variant="rounded" height="100%" width="100%" />}
                  {!loading && currentImage && <span style={{ fontWeight: 400 }}>{currentImage.description}</span>}
                </Typography>
              </div>
              <div className={classes.content}>
                <Button className={classes.button} onClick={handleClick}>
                  {loading ? (
                    <div className={clsx(classes.center, classes.progress)} children={<CircularProgress />} />
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
              <CarouselThumb key={i} image={image} carousel tooltipPlacement="top" />
            ))}
            <div className={classes.spacer} />
          </div>

          <div className={clsx(classes.center, classes.action, classes.close)} onClick={onCloseImage}>
            <IconButton color="primary" size="large" children={<CloseIcon />} />
          </div>
          <div className={clsx(classes.center, classes.action, classes.left)} onClick={onPreviousImage}>
            <IconButton size="large" children={<ArrowBackIosNewIcon />} />
          </div>
          <div className={clsx(classes.center, classes.action, classes.right)} onClick={onNextImage}>
            <IconButton size="large" children={<ArrowForwardIosIcon />} />
          </div>

          {/* <Button className={clsx(classes.center, classes.close)} children={<CloseIcon />} /> */}
          {/* <Button className={clsx(classes.center, classes.left)} children={<ArrowBackIosNewIcon />} />
          <Button className={clsx(classes.center, classes.right)} children={<ArrowForwardIosIcon />} /> */}
        </>
      </Modal>
    </Carousel>
  );
};

export const CarouselContainer = React.memo(WrappedCarouselContainer);
export default CarouselContainer;
