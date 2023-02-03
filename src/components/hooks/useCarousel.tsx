import { CarouselContext, CarouselContextProps } from 'components/providers/CarouselProvider';
import { useContext } from 'react';

export default function useCarousel(): CarouselContextProps {
  return useContext(CarouselContext) as CarouselContextProps;
}
