import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { alpha, Box, CircularProgress, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import Carousel from 'commons_deprecated/addons/elements/carousel/Carousel';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const XLSize = '96px';
const LGSize = '80px';
const MDSize = '64px';

const useStyles = makeStyles(theme => ({
  backdrop: {
    backgroundColor: 'transparent',
    backdropFilter: 'blur(1px)',
    zIndex: 1350
  },
  carousel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'nowrap',
    height: '100%',
    '@media (min-height:500px)': {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
    }
  },
  spacer: {
    flexGrow: 1
  },
  text: {
    color: 'white',
    display: 'none',
    '@media (min-height:500px)': {
      display: 'block'
    }
  },
  textContainer: {
    maxWidth: '90vh'
  },
  imageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.spacing(24),
    minWidth: theme.spacing(24)
  },
  image: {
    objectFit: 'contain',
    minHeight: theme.spacing(12),
    minWidth: theme.spacing(12),
    maxWidth: '100vw',
    maxHeight: `calc(95vh - 2*${theme.spacing(3)} - 2*${theme.spacing(2)})`,
    '@media (min-height:500px)': {
      maxHeight: `calc(95vh - ${MDSize} - 2*${theme.spacing(3)} - 2*${theme.spacing(2)})`
    },
    '@media (min-height:720px)': {
      maxHeight: `calc(95vh - ${LGSize} - 2*${theme.spacing(3)} - 2*${theme.spacing(2)})`
    },
    '@media (min-height:1080px)': {
      maxHeight: `calc(95vh - ${XLSize} - 2*${theme.spacing(3)} - 2*${theme.spacing(2)})`
    }
  },
  thumbsSection: {
    display: 'none',
    '@media (min-height:500px)': {
      flex: '0 1 auto',
      flexWrap: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw'
    }
  },
  thumbsSlide: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'hidden',
    overflowY: 'hidden',
    alignItems: 'center',
    gap: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  thumbContainer: {
    color: 'white',
    backgroundColor: '#00000080',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '@media (min-height:500px)': {
      borderRadius: theme.spacing(1),
      minHeight: MDSize,
      minWidth: MDSize,
      maxHeight: MDSize,
      maxWidth: MDSize,
      overflow: 'hidden'
    },
    '@media (min-height:720px)': {
      borderRadius: theme.spacing(1.5),
      minHeight: LGSize,
      minWidth: LGSize,
      maxHeight: LGSize,
      maxWidth: LGSize,
      overflow: 'hidden'
    },
    '@media (min-height:1080px)': {
      borderRadius: theme.spacing(2),
      minHeight: XLSize,
      minWidth: XLSize,
      maxHeight: XLSize,
      maxWidth: XLSize,
      overflow: 'hidden'
    }
  },
  thumb: {
    display: 'flex',
    '@media (min-height:500px)': {
      maxHeight: MDSize
    },
    '@media (min-height:720px)': {
      maxHeight: LGSize
    },
    '@media (min-height:1080px)': {
      maxHeight: XLSize
    }
  },
  unselectedThumb: {
    filter: `brightness(50%)`,
    transition: theme.transitions.create('filter', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.short
    }),
    '&:hover': {
      filter: `brightness(90%)`
    }
  },
  button: {
    '&:hover': {
      backgroundColor: alpha(theme.palette.secondary.main, 0.2)
    },
    cursor: 'pointer',
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    color: 'white',
    margin: theme.spacing(2)
  },
  closeButton: {
    position: 'absolute',
    top: '0px',
    right: '0px'
  },
  beforeButton: {
    position: 'absolute',
    top: '50%',
    left: '0px',
    transform: 'translate(0%, -50%)'
  },
  nextButton: {
    position: 'absolute',
    top: '50%',
    right: '0px',
    transform: 'translate(0%, -50%)'
  },
  imageLoading: {
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.spacing(1)
  },
  imageMissing: {
    backgroundColor: '#00000080',
    padding: theme.spacing(4)
  }
}));

export type CarouselContextProps = {
  carousel: boolean;
  index: number;
  images: Array<{
    name: string;
    description: string;
    imgSrc: string;
    thumbSrc: string;
  }>;
  setCarousel: (value: boolean) => void;
  openCarousel: (
    idx: number,
    imgs: Array<{
      name: string;
      description: string;
      imgSrc: string;
      thumbSrc: string;
    }>
  ) => void;
  closeCarousel: () => void;
  setIndex: (value: number) => void;
  setImages: (
    images: Array<{
      name: string;
      description: string;
      imgSrc: string;
      thumbSrc: string;
    }>
  ) => void;
};

export interface CarouselProviderProps {
  children: React.ReactNode;
}

export const CarouselContext = React.createContext<CarouselContextProps>(null);

function CarouselProvider(props: CarouselProviderProps) {
  const classes = useStyles();
  const { children } = props;
  const [carousel, setCarousel] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [images, setImages] = useState<
    Array<{
      name: string;
      description: string;
      imgSrc: string;
      thumbSrc: string;
    }>
  >([]);
  const carouselItemsRef = useRef<HTMLDivElement[] | null[]>([]);

  const openCarousel = (idx, imgs) => {
    setIndex(idx);
    setImages(imgs);
    setCarousel(true);
  };

  const closeCarousel = () => {
    setCarousel(false);
    setIndex(0);
    setImages([]);
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

  const onPreviousImage = useCallback(() => {
    if (images && images.length > 0) {
      let newIndex = index >= 1 ? index - 1 : images.length - 1;
      handleSelectedImageChange(newIndex);
    }
  }, [handleSelectedImageChange, images, index]);

  const onNextImage = useCallback(() => {
    if (images && images.length > 0) {
      let newIndex = index < images.length - 1 ? index + 1 : 0;
      handleSelectedImageChange(newIndex);
    }
  }, [handleSelectedImageChange, images, index]);

  useEffect(() => {
    if (images && images[index]) {
      carouselItemsRef.current = carouselItemsRef.current.slice(0, images.length);
      handleSelectedImageChange(index);
    }
  }, [index, images, handleSelectedImageChange]);

  return (
    <CarouselContext.Provider
      value={{
        carousel,
        index,
        images,
        setCarousel,
        openCarousel,
        closeCarousel,
        setIndex,
        setImages
      }}
    >
      {useMemo(
        () => (
          <>{children}</>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [children]
      )}
      {useMemo(
        () =>
          carousel &&
          images.length && (
            <Drawer open classes={{ paper: classes.backdrop }}>
              <Carousel
                autofocus
                enableSwipe
                escapeCallback={closeCarousel}
                onNext={onNextImage}
                onPrevious={onPreviousImage}
                style={{ height: '100%' }}
              >
                <div id="carousel-image" className={classes.carousel} tabIndex={-1}>
                  <div className={classes.spacer} />
                  <div className={classes.textContainer} style={{ paddingBottom: '4px' }}>
                    <Typography className={classes.text} variant="body2" noWrap>
                      {images[index].name}
                    </Typography>
                  </div>
                  <Image alt={images[index].name} src={images[index].imgSrc} />
                  <div className={classes.textContainer} style={{ paddingTop: '4px' }}>
                    <Typography className={classes.text} variant="body2" noWrap>
                      {images[index].description}
                    </Typography>
                  </div>
                  <div className={classes.spacer} />
                  <div className={classes.thumbsSection}>
                    <div className={classes.thumbsSlide}>
                      {images.map((element, i) => {
                        return (
                          <Image
                            key={'thumb-' + i}
                            alt={element.name}
                            src={element.thumbSrc}
                            isThumb
                            thumbSelected={index === i}
                            onClick={() => {
                              handleSelectedImageChange(i);
                            }}
                            onRef={el => (carouselItemsRef.current[i] = el)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <IconButton className={clsx(classes.button, classes.closeButton)} onClick={closeCarousel} size="large">
                  <CloseOutlinedIcon />
                </IconButton>

                <IconButton
                  className={clsx(classes.button, classes.beforeButton)}
                  onClick={onPreviousImage}
                  size="large"
                >
                  <NavigateBeforeIcon />
                </IconButton>

                <IconButton className={clsx(classes.button, classes.nextButton)} onClick={onNextImage} size="large">
                  <NavigateNextIcon />
                </IconButton>
              </Carousel>
            </Drawer>
          ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [carousel, images, index]
      )}
    </CarouselContext.Provider>
  );
}

export default CarouselProvider;

type ImageProps = {
  id?: string;
  alt: string;
  src: string;
  isThumb?: boolean;
  thumbSelected?: boolean;
  onClick?: () => void;
  onRef?: (el: HTMLDivElement) => void;
};

const Image = ({ id, alt, src, isThumb, thumbSelected, onClick, onRef }: ImageProps) => {
  const [image, setImage] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { t } = useTranslation(['carousel']);

  useEffect(() => {
    setLoading(true);
    setImage(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alt, src]);

  return (
    <Tooltip title={isThumb ? alt : ''} placement="top">
      <Box
        className={
          isThumb ? clsx(classes.thumbContainer, thumbSelected ? '' : classes.unselectedThumb) : classes.imageContainer
        }
        onClick={onClick}
      >
        {image ? (
          <img id={id} className={isThumb ? classes.thumb : classes.image} src={image} alt={alt} ref={onRef} />
        ) : loading ? (
          <div className={isThumb ? classes.thumb : classes.imageLoading} ref={onRef}>
            <CircularProgress color="secondary" />
          </div>
        ) : (
          <div ref={onRef}>
            <Box
              className={isThumb ? classes.thumb : clsx(classes.imageLoading, classes.imageMissing)}
              onClick={onClick}
            >
              <BrokenImageOutlinedIcon style={{ fontSize: isThumb ? '2rem' : '6rem' }} />
              {!isThumb && <Typography>{t('not_found')}</Typography>}
            </Box>
          </div>
        )}
      </Box>
    </Tooltip>
  );
};
