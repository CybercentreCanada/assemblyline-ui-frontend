import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { alpha, Button, CircularProgress, styled, Tooltip, useTheme } from '@mui/material';
import { useAppImageFetch } from 'core/api';
import { useAppInterfaceStore } from 'core/interface';
import { getAppCarouselBackgroundColor } from 'layout/carousel';
import { memo, useMemo } from 'react';

const ThumbImg = styled('img')(({ theme }) => ({
  minWidth: '50%',
  minHeight: '50%',
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  imageRendering: 'pixelated',
  filter: 'brightness(50%)',
  transition: theme.transitions.create('filter', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  }),
  '&:hover': { filter: 'brightness(90%)' }
}));

ThumbImg.displayName = 'ThumbImg';

//*****************************************************************************************
// AppCarouselItem
//*****************************************************************************************

/** Props for a single carousel thumbnail item. */
export type AppCarouselItemProps = {
  /** Alt text for the image. */
  alt: string;
  /** Position of the image in the carousel. */
  index: number;
  /** Image source hash/identifier. */
  src: string;
};

export const AppCarouselItem = memo(({ alt, index, src }: AppCarouselItemProps) => {
  const theme = useTheme();

  const backgroundMode = useAppInterfaceStore(s => s.carousel.backgroundMode);
  const selected = useAppInterfaceStore(s => s.carousel.index === index);

  const { data: image, isLoading: loading } = useAppImageFetch({ src, alt });

  const augmentedPaper = useMemo(
    () => theme.palette.augmentColor({ color: { main: theme.palette.background.default } }),
    [theme.palette]
  );

  return (
    <Tooltip title={alt} placement="top">
      <Button
        className="carousel-thumb"
        data-carousel-index={index}
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
            '&>img': { filter: 'brightness(100%)' }
          })
        }}
      >
        {image ? (
          <ThumbImg
            src={image}
            alt={alt}
            draggable={false}
            style={{
              backgroundColor: getAppCarouselBackgroundColor(backgroundMode, theme)
            }}
          />
        ) : loading ? (
          <CircularProgress color="primary" />
        ) : (
          <BrokenImageOutlinedIcon color="primary" fontSize="large" />
        )}
      </Button>
    </Tooltip>
  );
});

AppCarouselItem.displayName = 'AppCarouselItem';
