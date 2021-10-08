import { Button, CircularProgress, makeStyles, Theme, Tooltip } from '@material-ui/core';
import BrokenImageIcon from '@material-ui/icons/BrokenImage';
import useMyAPI from 'components/hooks/useMyAPI';
import { default as React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  imageList: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowY: 'hidden',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    width: '97.5%'
  },
  imageItem: {
    minHeight: '160px',
    minWidth: '160px',
    margin: '0.25rem',
    padding: '0.25rem'
  },
  imageLoading: {
    minHeight: '128px',
    minWidth: '128px',
    display: 'grid',
    placeItems: 'center'
  },
  image: {
    maxHeight: '128px',
    maxWidth: '128px'
  }
}));

const WrappedImageBody = ({ body }) => {
  const classes = useStyles();

  return (
    <div className={classes.imageList}>
      {JSON.parse(body).map((element, index) => (
        <ImageItem key={index} img={element.img.sha256} src={element.thumb.sha256} alt={element.thumb.name} />
      ))}
    </div>
  );
};

export const ImageBody = React.memo(WrappedImageBody);

const ImageItem = ({ img, alt, src }: { img: string; alt: string; src: string }) => {
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
  }, [alt, src, apiCall, image, loading]);

  return loading ? (
    <div className={classes.imageLoading}>
      <CircularProgress color="primary" />
    </div>
  ) : image ? (
    <Tooltip title={alt} placement="top">
      <Button
        className={classes.imageItem}
        component={Link}
        // target={element.newWindow ? '_blank' : null}
        to={`/file/viewer/${img}`}
        color="primary"
      >
        <img className={classes.image} src={image} alt={alt} />
      </Button>
    </Tooltip>
  ) : (
    <Tooltip title={alt} placement="top">
      <Button
        className={classes.imageItem}
        component={Link}
        // target={element.newWindow ? '_blank' : null}
        // href={element.sha256}
        to={null}
        color="primary"
        disabled={true}
      >
        <BrokenImageIcon color="primary" fontSize="large" />
      </Button>
    </Tooltip>
  );
};
