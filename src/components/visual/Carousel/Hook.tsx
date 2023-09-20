import { useContext } from 'react';
import { CarouselContext, CarouselContextProps } from '.';

export function useCarousel(): CarouselContextProps {
  return useContext(CarouselContext) as CarouselContextProps;
}
export default useCarousel;
