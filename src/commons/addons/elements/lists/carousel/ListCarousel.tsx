import Carousel from 'commons/addons/elements/carousel/Carousel';
import useListNavigator from 'commons/addons/elements/lists/hooks/useListNavigator';
import React from 'react';

interface ListCarouselProps {
  id: string;
  enableSwipe?: boolean;
  children: React.ReactElement;
}

const ListCarousel: React.FC<ListCarouselProps> = ({ id, enableSwipe, children }) => {
  const { selectNext, selectPrevious } = useListNavigator(id);
  return (
    <Carousel enableSwipe={enableSwipe} onNext={selectNext} onPrevious={selectPrevious}>
      {children}
    </Carousel>
  );
};

export default ListCarousel;
