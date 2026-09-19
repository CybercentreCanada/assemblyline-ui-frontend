import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Badge, Button, CircularProgress, Tooltip, useTheme } from '@mui/material';
import useCarousel from 'components/hooks/useCarousel';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Image, ImageBody } from 'components/models/base/result_body';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type ImageInlineBodyProps = {
  body: ImageBody;
  printable?: boolean;
  size?: 'small' | 'medium' | 'large';
};

const WrappedImageInlineBody = ({ body, printable = false, size = 'medium' }: ImageInlineBodyProps) => {
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

  return body && Array.isArray(body) ? <ImageInline data={data} printable={printable} size={size} /> : null;
};

type ImageInlineProps = {
  data: Image[];
  printable?: boolean;
  size?: 'small' | 'medium' | 'large';
};

const WrappedImageInline = ({ data, printable = false, size = 'medium' }: ImageInlineProps) => {
  const { openCarousel } = useCarousel();

  return data && data.length > 0 ? (
    <div style={{ ...(printable && { flexWrap: 'wrap' }) }}>
      <ImageItem
        src={size === 'large' ? data[0].img : data[0].thumb}
        alt={data[0].name}
        index={0}
        to={data[0].img}
        count={data.length}
        size={size}
        onImageClick={(e, index) => openCarousel(index, data)}
      />
    </div>
  ) : null;
};

type ImageItemProps = {
  src: string;
  alt: string;
  index: number;
  to?: string;
  count?: number;
  size?: 'small' | 'medium' | 'large';
  onImageClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, index: number) => void;
};

const WrappedImageItem = ({
  src,
  alt,
  index,
  to = null,
  count = 0,
  size = 'medium',
  onImageClick = () => null
}: ImageItemProps) => {
  const theme = useTheme();
  const { apiCall } = useMyAPI();

  const [image, setImage] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiCall<string>({
      url: `/api/v4/file/image/${src}/`,
      allowCache: true,
      onSuccess: api_data => setImage(api_data.api_response),
      onFailure: () => setImage(null),
      onEnter: () => setLoading(false),
      onExit: () => setLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alt, src]);

  return (
    <div>
      <Tooltip title={alt}>
        <Button
          component={Link}
          to={`/file/viewer/${to}/image/`}
          color="secondary"
          onClick={event => {
            event.preventDefault();
            onImageClick(event, index);
          }}
          sx={{
            display: 'inherit',
            padding: theme.spacing(0.5),
            textDecoration: 'none',

            ...(size === 'small' && {
              display: 'inherit',
              padding: theme.spacing(0.5),
              textDecoration: 'none'
            }),

            ...(size === 'large' && {
              display: 'inherit',
              padding: theme.spacing(0.5),
              textDecoration: 'none'
            })
          }}
        >
          <div
            style={{
              borderRadius: theme.spacing(0.5),
              display: 'grid',
              minHeight: theme.spacing(16),
              minWidth: theme.spacing(16),
              placeItems: 'center',

              ...(size === 'small' && {
                borderRadius: theme.spacing(0.5),
                display: 'grid',
                minHeight: theme.spacing(12),
                minWidth: theme.spacing(12),
                placeItems: 'center'
              }),

              ...(size === 'large' && {
                borderRadius: theme.spacing(0.5),
                display: 'grid',
                minHeight: theme.spacing(24),
                minWidth: theme.spacing(24),
                placeItems: 'center'
              })
            }}
          >
            {image ? (
              <Badge badgeContent={count > 1 ? count : 0} color="primary">
                <img
                  src={image}
                  alt={alt}
                  style={{
                    borderRadius: theme.spacing(0.5),
                    minWidth: theme.spacing(4),
                    minHeight: theme.spacing(4),
                    maxHeight: theme.spacing(16),
                    maxWidth: theme.spacing(16),
                    objectFit: 'contain',
                    boxShadow: theme.shadows[3],
                    imageRendering: 'pixelated',

                    ...(size === 'small' && {
                      borderRadius: theme.spacing(0.5),
                      minWidth: theme.spacing(3),
                      minHeight: theme.spacing(3),
                      maxHeight: theme.spacing(12),
                      maxWidth: theme.spacing(12),
                      objectFit: 'contain',
                      boxShadow: theme.shadows[2],
                      imageRendering: 'pixelated'
                    }),

                    ...(size === 'large' && {
                      borderRadius: theme.spacing(0.5),
                      minWidth: theme.spacing(8),
                      minHeight: theme.spacing(8),
                      maxHeight: theme.spacing(24),
                      maxWidth: theme.spacing(24),
                      objectFit: 'contain',
                      boxShadow: theme.shadows[3],
                      imageRendering: 'pixelated'
                    })
                  }}
                />
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
