import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { default as React, useMemo } from 'react';
import { CarouselThumb, Image } from '.';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    alignItems: 'center'
  },
  wrap: {
    flexWrap: 'wrap'
  }
}));

type Body = Array<{
  img: {
    description: string;
    name: string;
    sha256: string;
  };
  thumb: {
    description: string;
    name: string;
    sha256: string;
  };
}>;

type Props = {
  body: Body;
  printable?: boolean;
};

const WrappedImageBody = ({ body, printable = false }: Props) => {
  const classes = useStyles();

  const images = useMemo<Image[]>(
    () =>
      body && Array.isArray(body)
        ? body.map(item => ({
            name: item.img.name,
            description: item.img.description,
            img: item.img.sha256,
            thumb: item.thumb.sha256
          }))
        : [],
    [body]
  );

  return (
    images && (
      <div className={clsx(classes.container, printable && classes.wrap)}>
        {images.map((image, index) => (
          <CarouselThumb key={`${image.img}-${index}`} image={image} />
        ))}
      </div>
    )
  );
};

export const ImageBody = React.memo(WrappedImageBody);
export default ImageBody;
