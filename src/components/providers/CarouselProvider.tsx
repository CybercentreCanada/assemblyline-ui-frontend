import AddIcon from '@mui/icons-material/Add';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  alpha,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Paper,
  Skeleton,
  Slider,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import Carousel from 'commons/addons/carousel/Carousel';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const XLSize = '96px';
const LGSize = '80px';
const MDSize = '64px';

const useStyles = makeStyles(theme => ({
  backdrop: {
    // backgroundColor: 'transparent',
    backdropFilter: 'blur(2px)',
    transition: 'backdrop-filter 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
    zIndex: 1350
  },
  root: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto'
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
  menuInfo: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    columnGap: theme.spacing(1),
    rowGap: theme.spacing(0.5),
    minWidth: '10vw',
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
  menuPaper: {
    borderRadius: '0px 0px 4px 4px',
    display: 'grid',
    alignItems: 'start',
    gridTemplateColumns: '1fr auto',
    padding: theme.spacing(1),
    columnGap: theme.spacing(1),
    '&:hover>div>*': {
      whiteSpace: 'wrap'
    },
    '&:not(:hover)>div>*:nth-child(n + 5)': {
      display: 'none'
    },
    '&:hover>button': {
      transform: 'rotate(-180deg)'
    }
  },
  menuToggle: {
    cursor: 'default',
    margin: 0,
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    })
  },
  menuZoom: {
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
  menuZoomSlider: {
    '& .MuiSlider-thumb': {
      boxShadow: 'none'
    }
  },
  imageContainer2: {
    overflow: 'auto',
    display: 'grid',
    placeItems: 'center'
  },
  imageWrapper2: {
    position: 'relative',
    display: 'block',
    maxWidth: '100vw',
    '&:not(:hover)>button': {
      opacity: 0
    },
    '@media (min-width: 100vw)': {
      '&>button': {
        position: 'fixed',
        top: 'calc(50% - 20px)'
      }
    }
  },
  image2: {
    cursor: 'pointer'
  },
  imageButton2: {
    position: 'absolute',
    top: 'calc(50% - 20px)',
    backgroundColor: alpha(theme.palette.secondary.main, 0.5),
    opacity: 0.5,
    transition: theme.transitions.create('opacity', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    }),
    '&:hover': {
      backgroundColor: alpha(theme.palette.secondary.main, 0.5)
    }
  },
  imageNext: {
    '&>button:nth-child(2)': {
      opacity: 1
    }
  },
  imagePrev: {
    '&>button:nth-child(1)': {
      opacity: 1
    }
  },
  title: {},
  closeArea: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  navbar: {
    height: 'min(148px, 20vw, 20vh)',
    width: '100%',
    bottom: 0,
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    columnGap: theme.spacing(2)
  },
  spacer2: {
    minWidth: 'calc(50vw - 128px)'
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
    },
    textAlign: 'center'
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
    imageRendering: 'pixelated',
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
    imageRendering: 'pixelated',
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
      backgroundColor: alpha(theme.palette.secondary.main, 0.5)
    },
    cursor: 'pointer',
    backgroundColor: alpha(theme.palette.secondary.main, 0.3),
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

export type Image = {
  name: string;
  description: string;
  img: string;
  thumb: string;
};

export type CarouselContextProps = {
  open: boolean;
  index: number;
  images: Image[];
  setOpen: (value: boolean) => void;
  openCarousel: (idx: number, imgs: Image[]) => void;
  closeCarousel: () => void;
  setIndex: (value: number) => void;
  setImages: (images: Image[]) => void;
  onPreviousImage: () => void;
  onNextImage: () => void;
};

export interface CarouselProviderProps {
  children: React.ReactNode;
}

export const CarouselContext = React.createContext<CarouselContextProps>(null);

function CarouselProvider({ children }: CarouselProviderProps) {
  const { t } = useTranslation('carousel');
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const [images, setImages] = useState<Image[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [data, setData] = useState<string>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);

  const currentImage = useMemo<Image>(() => images && images[index], [images, index]);

  const carouselItemsRef = useRef<HTMLDivElement[] | null[]>([]);

  const isSmall = useMediaQuery(
    `@media (max-width: ${theme.breakpoints.values.md}px) or (max-height: ${theme.breakpoints.values.sm}px)`
  );

  const openCarousel = useCallback((idx, imgs) => {
    setIndex(idx);
    setImages(imgs);
    setOpen(true);
  }, []);

  const closeCarousel = useCallback(() => {
    setOpen(false);
    setIndex(0);
    setImages([]);
  }, []);

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
    console.log('onPreviousImage');
    if (images && images.length > 0) {
      let newIndex = index >= 1 ? index - 1 : images.length - 1;
      handleSelectedImageChange(newIndex);
    }
  }, [handleSelectedImageChange, images, index]);

  const onNextImage = useCallback(() => {
    console.log('onNextImage');
    if (images && images.length > 0) {
      let newIndex = index < images.length - 1 ? index + 1 : 0;
      handleSelectedImageChange(newIndex);
    }
  }, [handleSelectedImageChange, images, index]);

  useEffect(() => {
    console.log(currentImage);
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
    if (images && images[index]) {
      carouselItemsRef.current = carouselItemsRef.current.slice(0, images.length);
      handleSelectedImageChange(index);
    }
  }, [index, images, handleSelectedImageChange]);

  useEffect(() => {
    const element = document.getElementById('carousel-image') as HTMLImageElement;
    if (!element) return;
    document.getElementById('carousel-image').style.width = `calc(${element.naturalWidth}px * ${zoom / 100})`;
  }, [data, zoom]);

  const handleImageMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const element = document.getElementById('image-wrapper') as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      if ((100 * (event.clientX - rect.x)) / rect.width > 35) {
        element.classList.add(classes.imageNext);
        element.classList.remove(classes.imagePrev);
      } else {
        element.classList.add(classes.imagePrev);
        element.classList.remove(classes.imageNext);
      }
    },
    [classes]
  );

  const handleImageMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const element = document.getElementById('image-wrapper') as HTMLDivElement;
      element.classList.remove(classes.imagePrev);
      element.classList.remove(classes.imageNext);
    },
    [classes]
  );

  const handleImageClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      console.log('handleImageClick');
      event.stopPropagation();
      event.preventDefault();
      const element = document.getElementById('image-wrapper') as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      if ((100 * (event.clientX - rect.x)) / rect.width > 35) {
        onNextImage();
      } else {
        onPreviousImage();
      }
    },
    [onNextImage, onPreviousImage]
  );

  const handleClose = useCallback((event: React.MouseEvent<any, MouseEvent>) => {
    console.log('handleClose');
    event.stopPropagation();
    event.preventDefault();
    setOpen(false);
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        open,
        index,
        images,
        setOpen,
        openCarousel,
        closeCarousel,
        setIndex,
        setImages,
        onPreviousImage,
        onNextImage
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
          images.length > 0 && (
            <Carousel onNext={onNextImage} onPrevious={onPreviousImage}>
              <Modal className={classes.backdrop} open={open} onClose={closeCarousel}>
                <>
                  <div className={classes.root}>
                    <div className={classes.closeArea} onClick={closeCarousel}>
                      <IconButton
                        className={classes.button}
                        size={isSmall ? 'small' : 'large'}
                        children={<CloseIcon />}
                      />
                    </div>
                    {!loading && (
                      <div id="carousel-wrapper" className={classes.imageContainer2} onClick={handleClose}>
                        <IconButton
                          className={classes.imageButton2}
                          size={isSmall ? 'small' : 'large'}
                          style={{ left: theme.spacing(2) }}
                          children={<ChevronLeftOutlinedIcon />}
                        />

                        <IconButton
                          className={classes.imageButton2}
                          size={isSmall ? 'small' : 'large'}
                          style={{ right: theme.spacing(2) }}
                          children={<ChevronRightOutlinedIcon />}
                        />
                        <div
                          id="image-wrapper"
                          className={classes.imageWrapper2}
                          onMouseMove={handleImageMouseMove}
                          onMouseLeave={handleImageMouseLeave}
                          onClick={handleImageClick}
                        >
                          <img
                            id="carousel-image"
                            alt={currentImage?.name}
                            className={classes.image2}
                            draggable={false}
                            src={data}
                            style={{
                              minWidth: '256px',
                              // width: `${zoom}%`
                              // minWidth: `max(${zoom}%, 256px)`,
                              // minWidth: `256px`,
                              maxWidth: `max(${zoom}vw, 256px)`
                              // transform: `scale(${Math.max(zoom / 100, 1)})`
                              // transform: `scale(${zoom / 100})`
                              // transform: `translate(-${zoom}%, -${zoom}%) scale(${zoom / 100})`
                            }}
                          />
                        </div>
                        {/* </div> */}
                      </div>
                    )}
                    <div id="carousel-navbar" className={classes.navbar}>
                      <div className={classes.spacer2} />
                      {images.map((image, i) => (
                        <ImageItem
                          key={'thumb-' + i}
                          alt={image.name}
                          src={image.thumb}
                          isThumb
                          thumbSelected={index === i}
                          onClick={() => handleSelectedImageChange(i)}
                          onRef={el => (carouselItemsRef.current[i] = el)}
                        />
                      ))}
                      <div className={classes.spacer2} />
                    </div>
                  </div>
                  <div className={clsx(classes.menu, isSmall && classes.menuSmall)}>
                    <Paper className={classes.menuPaper}>
                      <div className={classes.menuInfo}>
                        <div>{t('name')}</div>
                        <div>{loading ? <Skeleton variant="rounded" /> : !currentImage ? '' : currentImage?.name}</div>
                        <div>{t('description')}</div>
                        <div>
                          {loading ? <Skeleton variant="rounded" /> : !currentImage ? '' : currentImage?.description}
                        </div>
                        <Divider style={{ gridColumn: 'span 2' }} />
                        <div>{t('zoom')}</div>
                        <div className={classes.menuZoom}>
                          <div style={{ textAlign: 'end', minWidth: '35px' }}>{`${zoom}%`}</div>
                          <IconButton
                            size="small"
                            onClick={() => setZoom(z => Math.max(10, z - 10))}
                            children={<RemoveIcon fontSize="small" />}
                          />
                          <Slider
                            className={classes.menuZoomSlider}
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

                        {/* <Stack component="span" spacing={2} direction="row" sx={{ height: '42px' }} alignItems="center">
                          <span style={{ textAlign: 'end', minWidth: '35px' }}>{`${zoom}%`}</span>
                          <IconButton
                            size="small"
                            onClick={() => setZoom(z => Math.max(10, z - 10))}
                            children={<RemoveIcon fontSize="small" />}
                          />
                          <Slider
                            aria-label="Volume"
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
                        </Stack> */}
                      </div>

                      <IconButton
                        className={classes.menuToggle}
                        disableRipple
                        disableFocusRipple
                        disableTouchRipple
                        size="small"
                        children={<ExpandMoreIcon />}
                      />
                    </Paper>
                  </div>
                </>
              </Modal>
            </Carousel>
          ),
        [
          classes,
          closeCarousel,
          currentImage,
          data,
          handleClose,
          handleImageClick,
          handleImageMouseLeave,
          handleImageMouseMove,
          handleSelectedImageChange,
          images,
          index,
          isSmall,
          loading,
          onNextImage,
          onPreviousImage,
          open,
          t,
          theme,
          zoom
        ]
      )}
      {/* {useMemo(
        () =>
          open &&
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
                    <Typography className={classes.text} variant="body2">
                      {images[index].name}
                    </Typography>
                  </div>
                  <ImageItem alt={images[index].name} src={images[index].img} />
                  <div className={classes.textContainer} style={{ paddingTop: '4px' }}>
                    <Typography className={classes.text} variant="body2">
                      {images[index].description}
                    </Typography>
                  </div>
                  <div className={classes.spacer} />
                  <div className={classes.thumbsSection}>
                    <div className={classes.thumbsSlide}>
                      {images.map((element, i) => {
                        return (
                          <ImageItem
                            key={'thumb-' + i}
                            alt={element.name}
                            src={element.thumb}
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
        [open, images, index]
      )} */}
    </CarouselContext.Provider>
  );
}

export default CarouselProvider;

type ImageItemProps = {
  id?: string;
  alt: string;
  src: string;
  isThumb?: boolean;
  thumbSelected?: boolean;
  onClick?: () => void;
  onRef?: (el: HTMLDivElement) => void;
};

const ImageItem = ({ id, alt, src, isThumb, thumbSelected, onClick, onRef }: ImageItemProps) => {
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
