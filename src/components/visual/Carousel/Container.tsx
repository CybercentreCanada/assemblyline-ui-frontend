import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Button, CircularProgress, Modal, Skeleton, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Carousel from 'commons/addons/carousel/Carousel';
import useMyAPI from 'components/hooks/useMyAPI';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { CarouselThumb, useCarousel } from '.';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'fixed',
    left: 'calc(50vw - 64px)',
    top: '50vh',
    translate: '-50% -50%',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
    borderRadius: theme.spacing(1),
    paddingBottom: theme.spacing(1),

    backgroundColor: theme.palette.common.black
  },
  button: {
    padding: 0
  },
  image: {
    maxHeight: '80vh',
    maxWidth: '50vw',
    padding: 0,
    backgroundColor: theme.palette.common.black
  },
  navbar: {
    position: 'absolute',
    height: '100vh',
    width: '150px',
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    overflowY: 'auto'
  },
  header: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    rowGap: theme.spacing(0.5),
    margin: theme.spacing(1)
  },
  empty: {
    height: '50vh',
    width: '50vw',
    display: 'grid',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));

export const WrappedCarouselContainer = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { open, images, onCloseImage, onNextImage, onPreviousImage } = useCarousel();

  const [data, setData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const currentImage = useMemo(() => {
    const query = new SimpleSearchQuery(location.search).get('carousel', null);
    const index = images.findIndex(i => i.name === query);
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
    <Modal open={open} onClose={onCloseImage}>
      <>
        {currentImage && (
          <Carousel onNext={onNextImage} onPrevious={onPreviousImage}>
            <div className={classes.root}>
              <Typography className={classes.header} variant="subtitle2">
                <span style={{ fontWeight: 500 }}>{t('name')}</span>
                <span style={{ fontWeight: 400 }}>
                  {loading ? (
                    <Skeleton variant="rounded" height="100%" width="100%" />
                  ) : (
                    currentImage && currentImage.name
                  )}
                </span>
                <span style={{ fontWeight: 500 }}>{t('description')}</span>
                <span style={{ fontWeight: 400 }}>
                  {loading ? (
                    <Skeleton variant="rounded" height="100%" width="100%" />
                  ) : (
                    currentImage && currentImage.description
                  )}
                </span>
              </Typography>

              {loading ? (
                <div className={classes.empty}>
                  <CircularProgress />
                </div>
              ) : (
                <Button className={classes.button} onClick={handleClick}>
                  {data ? (
                    <img className={classes.image} src={data} alt={currentImage.name} />
                  ) : (
                    <div className={classes.empty}>
                      <BrokenImageOutlinedIcon fontSize="large" />
                    </div>
                  )}
                </Button>
              )}
            </div>
          </Carousel>
        )}
        <div className={classes.navbar}>
          {images.map((image, i) => (
            <CarouselThumb key={i} image={image} carousel tooltipPlacement="left" />
          ))}
        </div>
      </>
    </Modal>
  );
};

export const CarouselContainer = React.memo(WrappedCarouselContainer);
export default CarouselContainer;
