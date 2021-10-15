import { alpha, Box, CircularProgress, Grid, IconButton, makeStyles, Theme, Typography } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import Dialog from '@material-ui/core/Dialog';
import BrokenImageOutlinedIcon from '@material-ui/icons/BrokenImageOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NotesIcon from '@material-ui/icons/Notes';
import clsx from 'clsx';
import Carousel from 'commons/addons/elements/carousel/Carousel';
import useMyAPI from 'components/hooks/useMyAPI';
import { default as React, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: alpha(grey[900], 0.4),
    height: '100vh',
    width: '100vw'
  },
  grid: {
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - 200px)',
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    gridAutoFlow: 'row',
    gridTemplateColumns: 'minmax(75px, 10%) 1fr minmax(75px, 10%)',
    gridTemplateRows: '100px 1fr',
    gridTemplateAreas: `'top-left top-center top-right'
                        'middle-left middle-center middle-right'`
  },
  topCenterBox: {
    height: '100%',
    width: '100%'
  },
  gridBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonBox: {
    cursor: 'pointer',
    height: '100%',
    width: '100%',
    borderRadius: theme.spacing(0.5),
    transitionDuration: '150ms',
    transitions: {
      easing: {
        easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        sharp: 'linear'
      }
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
      transitionDuration: '150ms',
      transitions: {
        easing: {
          easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          sharp: 'linear'
        }
      }
    },
    '&:hover > .MuiButtonBase-root': {
      backgroundColor: 'white'
    }
  },
  button: {
    backgroundColor: theme.palette.secondary.main
  },
  mainBox: {
    width: '100%',
    maxHeight: 'calc(95vh - 250px)'
  },
  mainImage: {
    // cursor: 'pointer',
    objectFit: 'contain',
    maxWidth: '100vw',
    maxHeight: 'calc(100vh - 200px)',
    position: 'relative',
    display: 'inline-block'
  },
  detailedImage: {
    objectFit: 'contain',
    width: '100%',
    position: 'relative',
    display: 'inline-block',
    [theme.breakpoints.up('xs')]: {
      maxHeight: 'calc(45vh - 100px)'
    },
    [theme.breakpoints.up('lg')]: {
      maxHeight: 'calc(95vh - 250px)'
    }
  },
  detailsBox: {
    maxHeight: 'calc(95vh - 250px)',
    overflowY: 'auto',
    padding: theme.spacing(2),
    color: 'white'
  },
  imageLoading: {
    borderRadius: theme.spacing(0.5),
    display: 'grid',
    minHeight: theme.spacing(16),
    minWidth: theme.spacing(16),
    placeItems: 'center'
  },
  thumbsBox: {
    display: 'flex',
    flexWrap: 'nowrap',
    maxWidth: '100%',
    width: 'auto',
    overflowX: 'hidden',
    overflowY: 'hidden',
    alignItems: 'center'
  },
  unselectedThumb: {
    filter: `brightness(50%)`,
    transitionDuration: '150ms',
    transitions: {
      easing: {
        easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        sharp: 'linear'
      }
    },
    '&:hover': {
      filter: `brightness(90%)`,
      transitionDuration: '150ms',
      transitions: {
        easing: {
          easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          sharp: 'linear'
        }
      }
    }
  },
  thumb: {
    cursor: 'pointer',
    objectFit: 'cover',
    height: '32px',
    width: '32px',
    [theme.breakpoints.up('md')]: {
      height: '100px',
      width: '100px'
    },
    borderRadius: theme.spacing(1)
  }
}));

type CarouselDialogProps = {
  open: boolean;
  onClose: (value: boolean) => void;
  initialIndex: number;
  images: Array<{
    name: string;
    description: string;
    imgSrc: string;
    thumbSrc: string;
  }>;
};

const WrappedCarouselDialog = ({ open, onClose, initialIndex, images }: CarouselDialogProps) => {
  const { t } = useTranslation(['carouselDialog']);
  const classes = useStyles();
  const [index, setIndex] = useState<number>(initialIndex);
  const [details, setDetails] = useState<boolean>(false);
  const carouselItemsRef = useRef<HTMLDivElement[] | null[]>([]);

  const onCloseDialog = () => {
    onClose(false);
  };

  const onToggleDetails = () => {
    details ? setDetails(false) : setDetails(true);
  };

  const onPreviousImage = () => {
    if (images && images.length > 0) {
      let newIndex = index >= 1 ? index - 1 : images.length - 1;
      handleSelectedImageChange(newIndex);
    }
  };

  const onNextImage = () => {
    if (images && images.length > 0) {
      let newIndex = index < images.length - 1 ? index + 1 : 0;
      handleSelectedImageChange(newIndex);
    }
  };

  const handleSelectedImageChange = useCallback(
    (newIndex: number) => {
      if (images && images.length > 0) {
        setIndex(newIndex);
        if (carouselItemsRef?.current[newIndex]) {
          carouselItemsRef?.current[newIndex]?.scrollIntoView({
            inline: 'center',
            behavior: 'smooth'
          });
        }
      }
    },
    [images]
  );

  useEffect(() => {
    if (images && images[initialIndex]) {
      carouselItemsRef.current = carouselItemsRef.current.slice(0, images.length);
      handleSelectedImageChange(initialIndex);
    }
  }, [initialIndex, images, handleSelectedImageChange]);

  return open && images.length ? (
    <Dialog
      className={classes.container}
      open={open}
      onClose={onCloseDialog}
      fullScreen={true}
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          backdropFilter: 'blur(1px)'
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100vw', height: '100vh' }}>
        <div style={{ flexGrow: 1, display: 'inline-flex', alignItems: 'center' }}>
          <Carousel enableSwipe onNext={onNextImage} onPrevious={onPreviousImage}>
            {details ? (
              <Box
                className={clsx(classes.mainBox)}
                sx={{
                  display: 'grid',
                  alignItems: 'top',
                  justifyContent: 'center',
                  gridAutoFlow: 'row',
                  gridTemplateColumns: { xs: '1fr ', lg: 'repeat(2, minmax(0, 1fr));' },
                  gridTemplateRows: { xs: 'repeat(2, minmax(0, 1fr)); ', lg: '1fr' },
                  gridTemplateAreas: {
                    xs: `'image'
                         'text'`,
                    lg: `'image text'`
                  }
                }}
              >
                <Box sx={{ gridArea: 'image' }}>
                  <Image className={classes.detailedImage} alt={images[index].name} src={images[index].imgSrc} />
                </Box>
                <Box className={classes.detailsBox} sx={{ gridArea: 'text' }}>
                  <Grid container spacing={1}>
                    <Grid item xs={4} sm={3} lg={2}>
                      <Typography variant="body1" noWrap>
                        <b>{t('title')}</b>
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9} lg={10}>
                      <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{images[index].name}</span>
                    </Grid>

                    <Grid item xs={4} sm={3} lg={2}>
                      <Typography variant="body1" noWrap>
                        <b>{t('description')}</b>
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9} lg={10}>
                      <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{images[index].description}</span>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ) : (
              <>
                <div>{images[index].name}</div>
                <Image className={classes.mainImage} alt={images[index].name} src={images[index].imgSrc} />
                <div>{images[index].description}</div>
              </>
            )}
          </Carousel>
        </div>
        <Box className={clsx(classes.gridBox)} sx={{ gridArea: 'bottom' }}>
          <Grid className={clsx(classes.thumbsBox)} container spacing={2}>
            {images.map((element, i) => {
              return index === i ? (
                <Grid
                  key={i}
                  item
                  onClick={() => {
                    handleSelectedImageChange(i);
                  }}
                  ref={el => (carouselItemsRef.current[i] = el)}
                >
                  <Image className={clsx(classes.thumb)} alt={element.name} src={element.thumbSrc} />
                </Grid>
              ) : (
                <Grid
                  key={i}
                  item
                  onClick={() => {
                    handleSelectedImageChange(i);
                  }}
                  ref={el => (carouselItemsRef.current[i] = el)}
                >
                  <Image
                    className={clsx(classes.thumb, classes.unselectedThumb)}
                    alt={element.name}
                    src={element.thumbSrc}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </div>
      <Box className={classes.grid}>
        <Box className={clsx(classes.topCenterBox)} sx={{ gridArea: 'top-center' }} onClick={onCloseDialog}></Box>
        <Box className={clsx(classes.gridBox, classes.buttonBox)} sx={{ gridArea: 'top-left' }} onClick={onCloseDialog}>
          <IconButton className={clsx(classes.button)}>
            <CloseOutlinedIcon fontSize={'large'} />
          </IconButton>
        </Box>
        <Box
          className={clsx(classes.gridBox, classes.buttonBox)}
          sx={{ gridArea: 'top-right' }}
          onClick={onToggleDetails}
        >
          <IconButton className={clsx(classes.button)}>
            <NotesIcon fontSize={'large'} />
          </IconButton>
        </Box>
        <Box
          className={clsx(classes.gridBox, classes.buttonBox)}
          sx={{ gridArea: 'middle-left' }}
          onClick={onPreviousImage}
        >
          <IconButton className={clsx(classes.button)}>
            <NavigateBeforeIcon fontSize={'large'} />
          </IconButton>
        </Box>
        <Box
          className={clsx(classes.gridBox, classes.buttonBox)}
          sx={{ gridArea: 'middle-right' }}
          onClick={onNextImage}
        >
          <IconButton className={clsx(classes.button)}>
            <NavigateNextIcon fontSize={'large'} />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  ) : null;
};

export const CarouselDialog = React.memo(WrappedCarouselDialog);

type ImageProps = {
  className?: string;
  alt: string;
  src: string;
};

const Image = ({ className, alt, src }: ImageProps) => {
  const [image, setImage] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const classes = useStyles();
  const apiCall = useMyAPI();

  useEffect(() => {
    apiCall({
      url: `/api/v4/file/image/${src}/`,
      allowCache: true,
      onSuccess: api_data => {
        setLoading(false);
        setImage(api_data.api_response);
      },
      onFailure: api_data => {
        setLoading(false);
        setImage(null);
      }
    });
  }, [alt, src, apiCall, image, loading]);

  return (
    <>
      {image ? (
        <img className={className} src={image} alt={alt} />
      ) : (
        <div className={classes.imageLoading}>
          {loading ? <CircularProgress /> : <BrokenImageOutlinedIcon fontSize="large" />}
        </div>
      )}
    </>
  );
};
