import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Badge, Button, CircularProgress, Theme, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useCarousel from 'components/hooks/useCarousel';
import useMyAPI from 'components/hooks/useMyAPI';
import { Image } from 'components/visual/Carousel/Container';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  printable: {
    flexWrap: 'wrap'
  },
  imageBox: {
    height: theme.spacing(16),
    width: theme.spacing(16),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
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
    minWidth: theme.spacing(4),
    minHeight: theme.spacing(4),
    maxHeight: theme.spacing(16),
    maxWidth: theme.spacing(16),
    objectFit: 'contain',
    boxShadow: theme.shadows[3],
    imageRendering: 'pixelated'
  },
  imageBoxSM: {
    height: theme.spacing(12),
    width: theme.spacing(12),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
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
    minWidth: theme.spacing(3),
    minHeight: theme.spacing(3),
    maxHeight: theme.spacing(12),
    maxWidth: theme.spacing(12),
    objectFit: 'contain',
    boxShadow: theme.shadows[2],
    imageRendering: 'pixelated'
  }
}));

export type ImageBodyData = Array<{
  img: {
    name: string;
    description: string;
    sha256: string;
  };
  thumb: {
    name: string;
    description: string;
    sha256: string;
  };
}>;

type ImageInlineBodyProps = {
  body: ImageBodyData;
  printable?: boolean;
  small?: boolean;
};

type ImageInlineProps = {
  data: Image[];
  printable?: boolean;
  small?: boolean;
};

type ImageItemProps = {
  src: string;
  alt: string;
  index: number;
  to?: string;
  count?: number;
  small?: boolean;
  onImageClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, index: number) => void;
};

const WrappedImageInlineBody = ({ body, printable = false, small = false }: ImageInlineBodyProps) => {
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

  return body && Array.isArray(body) ? <ImageInline data={data} printable={printable} small={small} /> : null;
};

const WrappedImageInline = ({ data, printable = false, small = false }: ImageInlineProps) => {
  const classes = useStyles();
  const { openCarousel } = useCarousel();

  return data && data.length > 0 ? (
    <div className={clsx(printable && classes.printable)}>
      <ImageItem
        src={data[0].thumb}
        alt={data[0].name}
        index={0}
        to={data[0].img}
        count={data.length}
        small={small}
        onImageClick={(e, index) => openCarousel(index, data)}
      />
    </div>
  ) : null;
};

const WrappedImageItem = ({
  src,
  alt,
  index,
  to = null,
  count = 0,
  small = false,
  onImageClick = () => null
}: ImageItemProps) => {
  const [image, setImage] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  useEffect(() => {
    apiCall({
      url: `/api/v4/file/image/${src}/`,
      allowCache: true,
      onSuccess: api_data => setImage(api_data.api_response),
      onFailure: api_data => setImage(null),
      onEnter: () => setLoading(false),
      onExit: () => setLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alt, src]);

  return (
    <div>
      <Tooltip title={alt}>
        <Button
          className={clsx(classes.imageItem, small && classes.imageItemSM)}
          component={Link}
          to={`/file/viewer/${to}/image/`}
          color="secondary"
          onClick={event => {
            event.preventDefault();
            onImageClick(event, index);
          }}
        >
          <div className={clsx(classes.imageLoading, small && classes.imageLoadingSM)}>
            {image ? (
              <Badge badgeContent={count > 1 ? count : 0} color="primary">
                <img className={clsx(classes.image, small && classes.imageSM)} src={image} alt={alt} />
              </Badge>
            ) : loading ? (
              <CircularProgress />
            ) : (
              <BrokenImageOutlinedIcon fontSize="large" />
            )}
          </div>
        </Button>
      </Tooltip>
    </div>
  );
};

export const ImageInlineBody = React.memo(WrappedImageInlineBody);
export const ImageInline = React.memo(WrappedImageInline);
export const ImageItem = React.memo(WrappedImageItem);
