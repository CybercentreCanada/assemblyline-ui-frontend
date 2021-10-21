import { Button, CircularProgress, makeStyles, Theme, Tooltip } from '@material-ui/core';
import BrokenImageOutlinedIcon from '@material-ui/icons/BrokenImageOutlined';
import useCarousel from 'components/hooks/useCarousel';
import useMyAPI from 'components/hooks/useMyAPI';
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
  imageBox: {
    display: 'flex',
    height: theme.spacing(17),
    width: theme.spacing(17)
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
    maxHeight: theme.spacing(16),
    maxWidth: theme.spacing(16),
    objectFit: 'contain'
  }
}));

const WrappedImageBody = ({ body }) => {
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
    setData(
      JSON.parse(body).map(element => {
        return {
          name: element.img.name,
          description: element.img.description,
          imgSrc: element.img.sha256,
          thumbSrc: element.thumb.sha256
        };
      })
    );
    return () => {
      setData([]);
    };
  }, [body]);

  const OpenCarouselDialog = (index: number) => {
    openCarousel(index, data);
  };

  return body && Array.isArray(JSON.parse(body)) ? (
    <div className={classes.imageList}>
      {JSON.parse(body).map((element, index) => (
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
  const apiCall = useMyAPI();

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
