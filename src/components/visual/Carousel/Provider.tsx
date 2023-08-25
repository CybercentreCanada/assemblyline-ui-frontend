import useALContext from 'components/hooks/useALContext';
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

const WrappedCarouselProvider = ({ children }: CarouselProviderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useALContext();

  const [images, setImages] = useState<Image[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const onOpenImage = useCallback(
    (image: Image) => {
      const query = new SimpleSearchQuery(location.search);
      query.set(CAROUSEL_PARAM, image.img);
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

  const onNextImage = useCallback(() => {
    const query = new SimpleSearchQuery(location.search);
    const param = query.get('carousel', null);
    const index = images.findIndex(i => i.img === param);

    if (index >= 0 && index < images.length - 1) {
      query.set(CAROUSEL_PARAM, images[index + 1].img);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    }
  }, [images, location.hash, location.pathname, location.search, navigate]);

  const onPreviousImage = useCallback(() => {
    const query = new SimpleSearchQuery(location.search);
    const param = query.get('carousel', null);
    const index = images.findIndex(i => i.img === param);

    if (index >= 1 && index < images.length) {
      query.set(CAROUSEL_PARAM, images[index - 1].img);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    }
  }, [images, location.hash, location.pathname, location.search, navigate]);

  useEffect(
    () => setOpen(!!currentUser && !!new SimpleSearchQuery(location.search).get('carousel', null)),
    [currentUser, location.search]
  );

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

export const CarouselProvider = React.memo(WrappedCarouselProvider);
export default CarouselProvider;
