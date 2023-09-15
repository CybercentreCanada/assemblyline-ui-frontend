import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Badge, Button, CircularProgress, Theme, Tooltip } from '@mui/material';
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
    height: theme.spacing(17),
    width: theme.spacing(17),
    justifyContent: 'center'
  },
  imageItem: {
    display: 'inherit',
    padding: theme.spacing(0.5),
    textDecoration: 'none'
  },
  imageLoading: {
    borderRadius: theme.spacing(0.5),
    display: 'grid',
    minHeight: theme.spacing(16),
    minWidth: theme.spacing(16),
    placeItems: 'center'
  },
  image: {
    borderRadius: theme.spacing(0.5),
    minWidth: theme.spacing(16),
    maxHeight: theme.spacing(16),
    maxWidth: theme.spacing(16),
    objectFit: 'contain'
  },
  imageBoxSM: {
    display: 'flex',
    height: theme.spacing(13),
    width: theme.spacing(13),
    justifyContent: 'center'
  },
  imageItemSM: {
    display: 'inherit',
    padding: theme.spacing(0.5),
    textDecoration: 'none'
  },
  imageLoadingSM: {
    borderRadius: theme.spacing(0.5),
    display: 'grid',
    minHeight: theme.spacing(12),
    minWidth: theme.spacing(12),
    placeItems: 'center'
  },
  imageSM: {
    borderRadius: theme.spacing(0.5),
    minWidth: theme.spacing(12),
    maxHeight: theme.spacing(12),
    maxWidth: theme.spacing(12),
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
        count={data.length}
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
  count?: number;
};

const WrappedImageItem = ({ alt, src, index, handleOpenCarousel, small = false, count = null }: ImageItemProps) => {
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
            <Badge badgeContent={count} color="primary">
              <img src={image} alt={alt} className={small ? classes.imageSM : classes.image} />
            </Badge>
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
