import Carousel from 'commons_deprecated/addons/elements/carousel/Carousel';
import useListNavigator from 'commons_deprecated/addons/elements/lists/hooks/useListNavigator';
import React from 'react';

interface ListCarouselProps {
  id: string;
  enableSwipe?: boolean;
  disableArrowUp?: boolean;
  disableArrowDown?: boolean;
  disableArrowLeft?: boolean;
  disableArrowRight?: boolean;
  children: React.ReactElement;
}

const ListCarousel: React.FC<ListCarouselProps> = ({
  id,
  enableSwipe,
  disableArrowUp,
  disableArrowDown,
  disableArrowLeft,
  disableArrowRight,
  children
}) => {
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
};

export default ListCarousel;
