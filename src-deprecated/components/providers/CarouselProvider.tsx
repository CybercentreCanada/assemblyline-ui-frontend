import { CarouselContainer } from 'components/visual/Carousel/Container';
import React, { useCallback, useMemo, useState } from 'react';

export type Image = {
  name: string;
  description: string;
  img: string;
  thumb: string;
};

export type CarouselContextProps = {
  open: boolean;
  index: number;
  images: Image[];
  setOpen: (value: boolean) => void;
  openCarousel: (idx: number, imgs: Image[]) => void;
  closeCarousel: () => void;
  setIndex: (value: number) => void;
  setImages: (images: Image[]) => void;
};

export interface CarouselProviderProps {
  children: React.ReactNode;
}

export const CarouselContext = React.createContext<CarouselContextProps>(null);

function CarouselProvider({ children }: CarouselProviderProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(true);

  const openCarousel = useCallback((idx, imgs) => {
    setIndex(idx);
    setImages(imgs);
    setOpen(true);
  }, []);

  const closeCarousel = useCallback(() => {
    setOpen(false);
    setIndex(0);
    setImages([]);
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        open,
        index,
        images,
        setOpen,
        openCarousel,
        closeCarousel,
        setIndex,
        setImages
      }}
    >
      {useMemo(() => children, [children])}
      <CarouselContainer images={images} open={open} index={index} onClose={closeCarousel} setIndex={setIndex} />
    </CarouselContext.Provider>
  );
}

export default CarouselProvider;
