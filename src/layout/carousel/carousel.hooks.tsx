import type { ApiResponse } from 'core/api';
import { useApiCallFn } from 'core/api';
import type { BackgroundMode } from 'layout/carousel/carousel.models';
import { BACKGROUND_ORDER } from 'layout/carousel/carousel.models';
import type { AppCarouselContextProps } from 'layout/carousel/carousel.providers';
import type { Image } from 'models/base/result_body';
import { useCallback, useMemo, useState } from 'react';

/**
 * @name useAppCarouselState
 * @description Internal hook that creates carousel state for the provider.
 * @returns AppCarouselContextProps
 */
export const useAppCarouselState = (): AppCarouselContextProps => {
  const [images, setImages] = useState<Image[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const openCarousel = useCallback((idx: number, imgs: Image[]) => {
    setIndex(idx);
    setImages(imgs);
    setOpen(true);
  }, []);

  const closeCarousel = useCallback(() => {
    setOpen(false);
    setIndex(0);
    setImages([]);
  }, []);

  return useMemo(
    () => ({ closeCarousel, images, index, open, openCarousel, setIndex }),
    [closeCarousel, images, index, open, openCarousel]
  );
};

//*****************************************************************************************
// useCarouselKeyboard
//*****************************************************************************************

/**
 * @name useCarouselKeyboard
 * @description Returns keyboard/touch handlers for navigating carousel images.
 * @returns onKeyDown handler for the wrapper element
 */
export const useCarouselKeyboard = (
  onPrevious: (() => void) | null,
  onNext: (() => void) | null
): { onKeyDown: (event: React.KeyboardEvent) => void } => {
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') return;
      if ((event.key === 'ArrowLeft' || event.key === 'ArrowUp') && onPrevious) onPrevious();
      if ((event.key === 'ArrowRight' || event.key === 'ArrowDown') && onNext) onNext();
    },
    [onNext, onPrevious]
  );

  return { onKeyDown };
};

//*****************************************************************************************
// useImageFetch
//*****************************************************************************************

/**
 * @name useImageFetch
 * @description Fetches an image from the API and returns its base64 data.
 * @returns Object with data, loading state, and fetch trigger
 */
export const useImageFetch = (): {
  data: string | null;
  fetchImage: (hash: string) => void;
  loading: boolean;
} => {
  const apiCallFn = useApiCallFn<ApiResponse<string>>();
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchImage = useCallback(
    (hash: string) => {
      if (!hash) return;

      setLoading(true);
      apiCallFn({
        url: `/api/v4/file/image/${hash}/`,
        method: 'GET',
        onSuccess: (response: ApiResponse<string>) => {
          setData(response?.api_response ?? null);
          setLoading(false);
        },
        onFailure: () => {
          setData(null);
          setLoading(false);
        }
      });
    },
    [apiCallFn]
  );

  return { data, fetchImage, loading };
};

//*****************************************************************************************
// useBackgroundMode
//*****************************************************************************************

/**
 * @name useBackgroundMode
 * @description Cycles through background display modes for the image viewer.
 * @returns Current mode and toggle callback
 */
export const useBackgroundMode = (): {
  backgroundMode: BackgroundMode;
  toggleBackgroundMode: () => void;
} => {
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('transparent');

  const toggleBackgroundMode = useCallback(() => {
    setBackgroundMode(prev => {
      const idx = BACKGROUND_ORDER.indexOf(prev);
      return BACKGROUND_ORDER[(idx + 1) % BACKGROUND_ORDER.length];
    });
  }, []);

  return { backgroundMode, toggleBackgroundMode };
};
