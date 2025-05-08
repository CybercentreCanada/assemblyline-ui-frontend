import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { alpha, Button, CircularProgress, styled, Tooltip, useTheme } from '@mui/material';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { memo, useEffect, useMemo, useState } from 'react';

const Img = memo(
  styled('img')(({ theme }) => ({
    minWidth: '50%',
    minHeight: '50%',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    imageRendering: 'pixelated',
    filter: `brightness(50%)`,
    transition: theme.transitions.create('filter', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shortest
    }),
    '&:hover': {
      filter: `brightness(90%)`
    }
  }))
);

type Props = {
  alt: string;
  src: string;
  selected?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const WrappedCarouselItem = ({ alt, src, selected, onClick }: Props) => {
  // const { t } = useTranslation(['carousel']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();

  const [data, setData] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const augmentedPaper = useMemo(
    () => theme.palette.augmentColor({ color: { main: theme.palette.background.default } }),
    [theme.palette]
  );

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
      <Button
        className="carousel-thumb"
        onMouseUp={onClick}
        sx={{
          height: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.main : augmentedPaper.dark, 0.7),
          padding: 0,
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.light : augmentedPaper.main, 0.7)
          },

          ...(selected && {
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: alpha(theme.palette.mode === 'dark' ? augmentedPaper.light : augmentedPaper.main, 0.5),
            '&>img': {
              filter: `brightness(100%)`
            }
          })
        }}
      >
        {data ? (
          <Img src={data} alt={alt} draggable={false} />
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
