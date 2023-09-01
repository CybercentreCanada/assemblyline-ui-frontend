import useALContext from 'components/hooks/useALContext';
import { CarouselContainer } from 'components/visual/Carousel/Container';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export type Image = {
  id?: string; // unique id using the simple hash
  name: string;
  description: string;
  img: string; // sha256 of the image
  thumb: string; // sha256 of the thumb
};

export const CAROUSEL_PARAM = 'carousel';

export interface CarouselProviderProps {
  children: React.ReactNode;
}

export type CarouselContextProps = {
  open?: boolean;
  images: Image[];
  onOpenImage: (id: string) => void;
  onCloseImage: () => void;
  onAddImage: (img: Image, onIDChange: (id: string) => void) => void;
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

  const simpleHash = useCallback((text: string) => {
    let hash = 0;
    for (var i = 0; i < text.length; i++) {
      var char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }, []);

  const onOpenImage = useCallback(
    (id: string) => {
      const query = new SimpleSearchQuery(location.search);
      query.set(CAROUSEL_PARAM, id);
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
    (img: Image, onIDChange: (id: string) => void) => {
      setImages(imgs => {
        if (imgs.some(i => i.name === img.name && i.img === img.img)) return imgs;
        const count = imgs.filter(
          i => i.name === img.name || i.description === img.description || i.img === img.img
        ).length;
        const id = simpleHash(`${JSON.stringify(img)}${count}`);
        onIDChange(id);
        return [...imgs, { ...img, id }];
      });
    },
    [simpleHash]
  );

  const onRemoveImage = useCallback(
    (img: Image) => setImages(imgs => imgs.filter(i => i.name !== img.name || i.img !== img.img)),
    []
  );

  const onClearImages = useCallback(() => setImages([]), []);

  const onNextImage = useCallback(() => {
    const query = new SimpleSearchQuery(location.search);
    const param = query.get(CAROUSEL_PARAM, null);
    const index = images.findIndex(i => i.id === param);

    if (index >= 0 && index < images.length - 1) {
      query.set(CAROUSEL_PARAM, images[index + 1].id);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    }
  }, [images, location.hash, location.pathname, location.search, navigate]);

  const onPreviousImage = useCallback(() => {
    const query = new SimpleSearchQuery(location.search);
    const param = query.get(CAROUSEL_PARAM, null);
    const index = images.findIndex(i => i.id === param);

    if (index >= 1 && index < images.length) {
      query.set(CAROUSEL_PARAM, images[index - 1].id);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    }
  }, [images, location.hash, location.pathname, location.search, navigate]);

  useEffect(
    () =>
      setOpen(() => {
        if (!currentUser) return false;
        const query = new SimpleSearchQuery(location.search).get(CAROUSEL_PARAM, null);
        return images.some(image => image.id === query);
      }),
    [currentUser, images, location.search]
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
