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
  }
}));

const WrappedImageInline = ({ body, printable = false }) => {
  const classes = useStyles();
  const { openCarousel } = useCarousel();

  const [data, setData] = useState<
    Array<{
      name: string;
      description: string;
      imgSrc: string;
      thumbSrc: string;
    }>
  >([]);

  useEffect(() => {
    if (body != null) {
      setData(
        body.map(element => {
          return {
            name: element.img.name,
            description: element.img.description,
            imgSrc: element.img.sha256,
            thumbSrc: element.thumb.sha256
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
    <div className={printable ? classes.printable : null}>
      {data && data.length > 0 ? (
        <ImageItem src={data[0].thumbSrc} alt={data[0].name} index={0} handleOpenCarousel={OpenCarouselDialog} />
      ) : null}
    </div>
  ) : null;
};

export const ImageInline = React.memo(WrappedImageInline);

type ImageItemProps = {
  alt: string;
  src: string;
  index: number;
  handleOpenCarousel: (index: number) => void;
};

const ImageItem = ({ alt, src, index, handleOpenCarousel }: ImageItemProps) => {
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
    <div className={classes.imageBox}>
      {image ? (
        <Tooltip title={alt}>
          <Button className={classes.imageItem} onClick={handleImageClick}>
            <img src={image} alt={alt} className={classes.image} />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title={alt}>
          <Button className={classes.imageItem} onClick={handleImageClick} color="secondary">
            <div className={classes.imageLoading}>
              {loading ? <CircularProgress /> : <BrokenImageOutlinedIcon fontSize="large" />}
            </div>
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
