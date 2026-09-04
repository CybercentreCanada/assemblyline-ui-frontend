import { CarouselContainer } from 'layout/carousel/carousel.components';
import { useAppCarouselState } from 'layout/carousel/carousel.hooks';
import type { Image } from 'models/base/result_body';
import type { PropsWithChildren } from 'react';
import { createContext, memo, useContext } from 'react';

//*****************************************************************************************
// AppCarouselContextProps
//*****************************************************************************************

/** State and actions for the Carousel context. */
export type AppCarouselContextProps = {
  /** Close the carousel and reset state. */
  closeCarousel: () => void;
  /** Array of images being viewed. */
  images: Image[];
  /** Current image index. */
  index: number;
  /** Open the carousel at a specific image. */
  openCarousel: (idx: number, imgs: Image[]) => void;
  /** Whether the carousel modal is open. */
  open: boolean;
  /** Update current index. */
  setIndex: (value: number | ((prev: number) => number)) => void;
};

export const AppCarouselContext = createContext<AppCarouselContextProps>(null);

/**
 * @name useAppCarousel
 * @description Provides access to the carousel context for opening/closing the image viewer.
 * @returns CarouselContextValue
 */
export const useAppCarousel = (): AppCarouselContextProps => useContext(AppCarouselContext);

//*****************************************************************************************
// CarouselProvider
//*****************************************************************************************

export const AppCarouselProvider = memo(({ children }: PropsWithChildren) => {
  const state = useAppCarouselState();

  return (
    <AppCarouselContext.Provider value={state}>
      {children}
      <CarouselContainer
        images={state.images}
        open={state.open}
        index={state.index}
        onClose={state.closeCarousel}
        setIndex={state.setIndex}
      />
    </AppCarouselContext.Provider>
  );
});

AppCarouselProvider.displayName = 'AppCarouselProvider';
