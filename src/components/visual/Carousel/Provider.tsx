import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CarouselContainer } from '.';

export type Image = {
  name: string;
  description: string;
  img: string; // sha256 of the image
  thumb: string; // sha256 of the thumb
};

const CAROUSEL_PARAM = 'carousel';

export interface CarouselProviderProps {
  children: React.ReactNode;
}

export type CarouselContextProps = {
  open?: boolean;
  images: Image[];
  onOpenImage: (image: Image) => void;
  onCloseImage: () => void;
  onAddImage: (img: Image) => void;
  onRemoveImage: (img: Image) => void;
  onClearImages: () => void;
  onNextImage?: () => void;
  onPreviousImage?: () => void;
};

export const CarouselContext = React.createContext<CarouselContextProps>(null);

export const CarouselProvider2 = ({ children }: CarouselProviderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // const [images, setImages] = useState<{ [sha256: string]: Image }>({});
  const [images, setImages] = useState<Image[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const onOpenImage = useCallback(
    (image: Image) => {
      const query = new SimpleSearchQuery(location.search);
      query.set(CAROUSEL_PARAM, image.name);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    },
    [location.hash, location.pathname, location.search, navigate]
  );

  const onCloseImage = useCallback(() => {
    const query = new SimpleSearchQuery(location.search);
    query.pop(CAROUSEL_PARAM);
    navigate(`${location.pathname}?${query.toString()}${location.hash}`);
  }, [location.hash, location.pathname, location.search, navigate]);

  const onAddImage = useCallback(
    (img: Image) =>
      setImages(imgs => (imgs.some(i => i.name === img.name && i.img === img.img) ? imgs : [...imgs, img])),
    []
  );

  const onRemoveImage = useCallback(
    (img: Image) => setImages(imgs => imgs.filter(i => i.name !== img.name || i.img !== img.img)),
    []
  );

  const onClearImages = useCallback(() => setImages([]), []);

  const onNextImage = useCallback(() => console.log('onNextImage'), []);

  const onPreviousImage = useCallback(() => console.log('onPreviousImage'), []);

  useEffect(() => setOpen(!!new SimpleSearchQuery(location.search).get('carousel', null)), [location.search]);

  return (
    <CarouselContext.Provider
      value={{
        open,
        images,
        onAddImage,
        onClearImages,
        onCloseImage,
        onNextImage,
        onOpenImage,
        onPreviousImage,
        onRemoveImage
      }}
    >
      {useMemo(() => children, [children])}
      <CarouselContainer />
    </CarouselContext.Provider>
  );
};
