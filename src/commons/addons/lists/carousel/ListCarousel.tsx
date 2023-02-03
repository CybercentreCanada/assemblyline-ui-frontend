import Carousel from 'commons/addons/carousel/Carousel';
import useListNavigator from 'commons/addons/lists/hooks/useListNavigator';
import * as React from 'react';

interface ListCarouselProps {
  id: string;
  enableSwipe?: boolean;
  disableArrowUp?: boolean;
  disableArrowDown?: boolean;
  disableArrowLeft?: boolean;
  disableArrowRight?: boolean;
  children: React.ReactElement;
}

export default function ListCarousel({
  id,
  enableSwipe = false,
  disableArrowUp = false,
  disableArrowDown = false,
  disableArrowLeft = false,
  disableArrowRight = false,
  children
}: ListCarouselProps) {
  const { selectNext, selectPrevious } = useListNavigator(id);
  return (
    <Carousel
      enableSwipe={enableSwipe}
      disableArrowDown={disableArrowDown}
      disableArrowLeft={disableArrowLeft}
      disableArrowRight={disableArrowRight}
      disableArrowUp={disableArrowUp}
      onNext={selectNext}
      onPrevious={selectPrevious}
    >
      {children}
    </Carousel>
  );
}
