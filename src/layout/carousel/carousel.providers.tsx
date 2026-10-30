import { AppCarouselContainer } from 'layout/carousel';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

//*****************************************************************************************
// AppCarouselLayout
//*****************************************************************************************

export const AppCarouselLayout = memo(({ children }: PropsWithChildren) => (
  <>
    {children}
    <AppCarouselContainer />
  </>
));

AppCarouselLayout.displayName = 'AppCarouselLayout';
