import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useCarousel from 'components/hooks/useCarousel';
import { Image } from 'components/visual/Carousel/Container';
import { ImageBodyData, ImageItem } from 'components/visual/image_inline';
import { default as React, useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  imageList: {
    display: 'flex',
    flexWrap: 'nowrap',
    marginRight: theme.spacing(2),
    overflowX: 'auto',
    paddingBottom: theme.spacing(0.5),
    paddingTop: theme.spacing(0.5)
  },
  printable: {
    flexWrap: 'wrap'
  }
}));

type ImageBodyProps = {
  body: ImageBodyData;
  printable?: boolean;
  small?: boolean;
};

const WrappedImageBody = ({ body, printable = false }: ImageBodyProps) => {
  const classes = useStyles();
  const { openCarousel } = useCarousel();
  const [data, setData] = useState<Image[]>([]);

  useEffect(() => {
    if (body === null || !Array.isArray(body)) return;
    setData(
      body.map(element => ({
        name: element?.img?.name,
        description: element?.img?.description,
        img: element?.img?.sha256,
        thumb: element?.thumb?.sha256
      }))
    );
    return () => {
      setData([]);
    };
  }, [body]);

  return body && Array.isArray(body) ? (
    <div className={clsx(classes.imageList, printable && classes.printable)}>
      {data.map((element, index) => (
        <ImageItem
          key={index}
          src={element.thumb}
          alt={element.name}
          to={element.img}
          index={index}
          onImageClick={(e, i) => openCarousel(index, data)}
        />
      ))}
    </div>
  ) : null;
};

export const ImageBody = React.memo(WrappedImageBody);
