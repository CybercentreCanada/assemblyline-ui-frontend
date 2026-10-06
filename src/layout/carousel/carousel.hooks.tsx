import type { CarouselContextProps } from 'layout/carousel/carousel.providers';
import { CarouselContext } from 'layout/carousel/carousel.providers';
import { useContext } from 'react';

export default function useCarousel(): CarouselContextProps {
  return useContext(CarouselContext);
}
