import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Button, CircularProgress, Theme, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useCarousel from 'components/hooks/useCarousel';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  printable: {
    flexWrap: 'wrap'
  },
  imageBox: {
    display: 'flex',
    height: theme.spacing(26),
    width: theme.spacing(26)
  },
  imageItem: {
    display: 'inherit',
    padding: theme.spacing(0.5),
    textDecoration: 'none'
  },
  imageLoading: {
    borderRadius: theme.spacing(0.5),
    display: 'grid',
    minHeight: theme.spacing(24),
    minWidth: theme.spacing(24),
    placeItems: 'center'
  },
  image: {
    borderRadius: theme.spacing(0.5),
    minWidth: theme.spacing(24),
    maxHeight: theme.spacing(24),
    maxWidth: theme.spacing(24),
    objectFit: 'contain'
  },
  imageBoxSM: {
    display: 'flex',
    height: theme.spacing(17),
    width: theme.spacing(17)
  },
  imageItemSM: {
    display: 'inherit',
    padding: theme.spacing(0.5),
    textDecoration: 'none'
  },
  imageLoadingSM: {
    borderRadius: theme.spacing(0.5),
    display: 'grid',
    minHeight: theme.spacing(16),
    minWidth: theme.spacing(16),
    placeItems: 'center'
  },
  imageSM: {
    borderRadius: theme.spacing(0.5),
    maxHeight: theme.spacing(16),
    maxWidth: theme.spacing(16),
    objectFit: 'contain'
  }
}));

const WrappedImageInlineBody = ({ body, printable = false, small = false }) => {
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

  return body && Array.isArray(body) ? <ImageInline data={data} printable={printable} small={small} /> : null;
};

export const ImageInlineBody = React.memo(WrappedImageInlineBody);

const WrappedImageInline = ({ data, printable = false, small = false }) => {
  const classes = useStyles();
  const { openCarousel } = useCarousel();

  const OpenCarouselDialog = (index: number) => {
    openCarousel(index, data);
  };

  return data && data.length > 0 ? (
    <div className={printable ? classes.printable : null}>
      <ImageItem
        src={data[0].thumb}
        alt={data[0].name}
        index={0}
        handleOpenCarousel={OpenCarouselDialog}
        small={small}
      />
    </div>
  ) : null;
};

export const ImageInline = React.memo(WrappedImageInline);

type ImageItemProps = {
  alt: string;
  src: string;
  index: number;
  handleOpenCarousel: (index: number) => void;
  small?: boolean;
};

const WrappedImageItem = ({ alt, src, index, handleOpenCarousel, small = false }: ImageItemProps) => {
  const [image, setImage] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  useEffect(() => {
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

  const handleImageClick = () => {
    handleOpenCarousel(index);
  };

  return (
    <div className={small ? classes.imageBoxSM : classes.imageBox}>
      {image ? (
        <Tooltip title={alt}>
          <Button className={small ? classes.imageItemSM : classes.imageItem} onClick={handleImageClick}>
            <img src={image} alt={alt} className={small ? classes.imageSM : classes.image} />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title={alt}>
          <Button
            className={small ? classes.imageItemSM : classes.imageItem}
            onClick={handleImageClick}
            color="secondary"
          >
            <div className={small ? classes.imageLoadingSM : classes.imageLoading}>
              {loading ? <CircularProgress /> : <BrokenImageOutlinedIcon fontSize="large" />}
            </div>
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export const ImageItem = React.memo(WrappedImageItem);
