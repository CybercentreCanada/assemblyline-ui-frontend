import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Button, ImageListItemBar, Skeleton, Theme, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, useCarousel } from '.';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    minHeight: '128px',
    minWidth: '128px',
    padding: theme.spacing(0.5)
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: theme.spacing(0.5)
  },
  active: {
    backgroundColor: theme.palette.background.paper
  },
  carousel: {
    backgroundColor: theme.palette.common.black
  }
}));

type Props = {
  image?: Image;
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

const WrappedCarouselThumb = ({ image = null, carousel = false, tooltipPlacement = 'bottom' }: Props) => {
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { onAddImage, onRemoveImage, onOpenImage } = useCarousel();

  const [data, setData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const active = useMemo<boolean>(() => false, []);

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
    if (image && !carousel) onAddImage(image);
    return () => !carousel && onRemoveImage(image);
  }, [carousel, image, onAddImage, onRemoveImage]);

  return (
    <Tooltip title={image.name} placement={tooltipPlacement} disableHoverListener={carousel}>
      <Button
        className={clsx(classes.button, carousel && classes.carousel, active && classes.active)}
        onClick={() => onOpenImage(image)}
      >
        {loading ? (
          <Skeleton variant="rounded" height="100%" width="100%" />
        ) : data ? (
          <>
            <img className={classes.image} src={data} alt={image.name} />
            {carousel && (
              <ImageListItemBar title={image.name} subtitle={image.description} sx={{ textAlign: 'start' }} />
            )}
          </>
        ) : (
          <BrokenImageOutlinedIcon fontSize="large" />
        )}
      </Button>
    </Tooltip>
  );
};

export const CarouselThumb = React.memo(WrappedCarouselThumb);
export default CarouselThumb;
