import type { CarouselContextProps } from 'deprecated/legacy/components/providers/CarouselProvider';
import { CarouselContext } from 'deprecated/legacy/components/providers/CarouselProvider';
import { useContext } from 'react';

export default function useCarousel(): CarouselContextProps {
  return useContext(CarouselContext);
}
