import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Button, Skeleton, Theme, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useCarousel from 'components/hooks/useCarousel';
import useMyAPI from 'components/hooks/useMyAPI';
import { CAROUSEL_PARAM, Image } from 'components/providers/CarouselProvider';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    flexShrink: 0,
    padding: theme.spacing(0.5),
    boxSizing: 'border-box',
    width: 'min(128px, 20vw, 20vh)',
    height: 'min(128px, 20vw, 20vh)',
    objectFit: 'contain',
    borderRadius: theme.spacing(0.5)
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: theme.spacing(0.5)
  },
  carousel: {
    filter: 'brightness(0.5)',
    transition: theme.transitions.create('filter', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    }),
    '&:hover': {
      filter: `brightness(0.9)`
    }
  },
  selected: {
    filter: 'brightness(1)'
  },
  broken: {
    aspectRatio: 1
  }
}));

type Props = {
  classes?: {
    button?: string;
  };
  image?: Image;
  group?: string;
  carousel?: boolean;
  tooltipPlacement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
};

const WrappedCarouselThumb = ({
  classes: classesProps = null,
  image = null,
  group: groupProps = null,
  carousel = false,
  tooltipPlacement = 'top'
}: Props) => {
  const classes = useStyles();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { onAddImage, onRemoveImage, onOpenImage } = useCarousel();

  const [data, setData] = useState<string>(null);
  const [id, setID] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const group = useId();
  const ref = useRef<HTMLButtonElement>(null);

  const selected = useMemo<boolean>(() => {
    const query = new SimpleSearchQuery(location.search);
    return query.get(CAROUSEL_PARAM, null) === image.id;
  }, [image.id, location.search]);

  const handleIDChange = useCallback((value: string) => {
    setTimeout(() => {
      setID(value);
    }, 1);
  }, []);

  useEffect(() => {
    if (!image) return;
    apiCall({
      url: `/api/v4/file/image/${image.thumb}/`,
      allowCache: true,
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false),
      onSuccess: api_data => setData(api_data.api_response),
      onFailure: () => setData(null)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  useEffect(() => {
    if (image && !carousel) onAddImage({ ...image, group: groupProps || group }, handleIDChange);
    return () => !carousel && onRemoveImage(image);
  }, [carousel, group, groupProps, handleIDChange, image, onAddImage, onRemoveImage]);

  useEffect(() => {
    if (!carousel) return;
    const query = new SimpleSearchQuery(location.search);
    const param = query.get(CAROUSEL_PARAM, null);

    if (param === image.id) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [carousel, image.id, location.search]);

  return (
    <Tooltip title={image.name} placement={tooltipPlacement}>
      <Button
        className={clsx(
          classes.button,
          carousel && classes.carousel,
          !data && classes.broken,
          selected && classes.selected,
          classesProps?.button
        )}
        ref={ref}
        onClick={() => onOpenImage(image?.id || id)}
      >
        {loading ? (
          <Skeleton variant="rounded" height="100%" width="100%" />
        ) : data ? (
          <img className={classes.image} src={data} alt={image.name} />
        ) : (
          <BrokenImageOutlinedIcon fontSize="large" />
        )}
      </Button>
    </Tooltip>
  );
};

export const CarouselThumb = React.memo(WrappedCarouselThumb);
export default CarouselThumb;
