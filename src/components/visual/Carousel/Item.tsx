import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { alpha, Button, CircularProgress, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles(theme => {
  const augmentedPaper = theme.palette.augmentColor({ color: { main: theme.palette.background.default } });

  const options = {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  };

  return {
    button: {
      height: '100%',
      aspectRatio: '1 / 1',
      backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.main : augmentedPaper.dark, 0.7),
      padding: 0,
      overflow: 'hidden',
      '&:hover': {
        backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.light : augmentedPaper.main, 0.7)
      }
    },
    img: {
      minWidth: '50%',
      minHeight: '50%',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      imageRendering: 'pixelated',
      filter: `brightness(50%)`,
      transition: theme.transitions.create('filter', options),
      '&:hover': {
        filter: `brightness(90%)`
      }
    },
    selected: {
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.light : augmentedPaper.main, 0.5),
      '&>img': {
        filter: `brightness(100%)`
      }
    }
  };
});

type Props = {
  alt: string;
  src: string;
  selected?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const WrappedCarouselItem = ({ alt, src, selected, onClick }: Props) => {
  // const { t } = useTranslation(['carousel']);
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const [data, setData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiCall({
      url: `/api/v4/file/image/${src}/`,
      allowCache: true,
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false),
      onSuccess: api_data => setData(api_data.api_response),
      onFailure: () => setData(null)
    });

    return () => {
      setData(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alt, src]);

  return (
    <Tooltip title={alt} placement="top">
      <Button className={clsx('carousel-thumb', classes.button, selected && classes.selected)} onMouseUp={onClick}>
        {data ? (
          <img className={classes.img} src={data} alt={alt} draggable={false} />
        ) : loading ? (
          <CircularProgress color="primary" />
        ) : (
          <BrokenImageOutlinedIcon color="primary" fontSize="large" />
        )}
      </Button>
    </Tooltip>
  );
};

export const CarouselItem = React.memo(WrappedCarouselItem);
export default CarouselItem;
