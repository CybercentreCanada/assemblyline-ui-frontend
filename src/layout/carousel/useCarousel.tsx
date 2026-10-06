import type { CarouselContextProps } from 'layout/carousel/CarouselProvider';
import { CarouselContext } from 'layout/carousel/CarouselProvider';
import { useContext } from 'react';

export default function useCarousel(): CarouselContextProps {
  return useContext(CarouselContext);
}
