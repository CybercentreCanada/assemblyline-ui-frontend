import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useCarousel from 'components/hooks/useCarousel';
import { default as React, useEffect, useState } from 'react';
import { ImageItem } from '../image_inline';

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

const WrappedImageBody = ({ body, printable = false }) => {
  const classes = useStyles();
  const { openCarousel } = useCarousel();
  const [data, setData] = useState<
    Array<{
      name: string;
      description: string;
      img: string;
      thumb: string;
    }>
  >([]);

  useEffect(() => {
    if (body != null) {
      setData(
        body.map(element => {
          return {
            name: element.img.name,
            description: element.img.description,
            img: element.img.sha256,
            thumb: element.thumb.sha256
          };
        })
      );
    }
    return () => {
      setData([]);
    };
  }, [body]);

  const OpenCarouselDialog = (index: number) => {
    openCarousel(index, data);
  };

  return body && Array.isArray(body) ? (
    <div className={clsx(printable ? classes.printable : null, classes.imageList)}>
      {body.map((element, index) => (
        <ImageItem
          key={index}
          src={element.thumb.sha256}
          alt={element.img.name}
          index={index}
          handleOpenCarousel={OpenCarouselDialog}
        />
      ))}
    </div>
  ) : null;
};

export const ImageBody = React.memo(WrappedImageBody);
