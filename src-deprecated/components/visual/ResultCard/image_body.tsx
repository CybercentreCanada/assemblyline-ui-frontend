import { Box, useTheme } from '@mui/material';
import useCarousel from 'components/hooks/useCarousel';
import type { Image, ImageBody as ImageData } from 'components/models/base/result_body';
import { ImageItem } from 'components/visual/image_inline';
import { default as React, useEffect, useState } from 'react';

type Props = {
  body: ImageData;
  printable?: boolean;
  small?: boolean;
};

const WrappedImageBody = ({ body, printable = false }: Props) => {
  const theme = useTheme();
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
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        marginRight: theme.spacing(2),
        overflowX: 'auto',
        paddingBottom: theme.spacing(0.5),
        paddingTop: theme.spacing(0.5),

        ...(printable && {
          flexWrap: 'wrap'
        })
      }}
    >
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
    </Box>
  ) : null;
};

export const ImageBody = React.memo(WrappedImageBody);
