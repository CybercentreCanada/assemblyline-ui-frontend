import type { CarouselContextProps } from 'components/providers/CarouselProvider';
import { CarouselContext } from 'components/providers/CarouselProvider';
import { useContext } from 'react';

export default function useCarousel(): CarouselContextProps {
  return useContext(CarouselContext);
}
