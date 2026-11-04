import { DAY_IN_MS } from 'app/core.preference';
import { useApiQuery } from 'core/api/hooks/useApiQuery';

export type UseImageFetchProps = {
  /** Alternative text associated with the image. */
  alt?: string | null;
  /** Image source hash or identifier. */
  src: string | null;
};

/**
 * @name useAppImageFetch
 * @description Fetches and caches image data for a source hash.
 * @param props - Image source parameters.
 * @returns Image data and loading state.
 */
export const useAppImageFetch = ({ src = null }: UseImageFetchProps): ReturnType<typeof useApiQuery<string>> =>
  useApiQuery<string>({
    allowCache: true,
    disabled: !src,
    url: src ? `/api/v4/file/image/${src}/` : '',
    queryProps: {
      placeholderData: undefined,
      staleTime: DAY_IN_MS,
      gcTime: DAY_IN_MS
    }
  });
