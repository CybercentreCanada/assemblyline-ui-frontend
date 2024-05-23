import type { ReactNode } from 'react';
import { memo } from 'react';
import type { PageProps } from './hooks/usePageProps';
import usePageProps from './hooks/usePageProps';

type PageContentProps = PageProps & {
  children?: ReactNode;
};

const PageContent = ({ children, ...props }: PageContentProps) => {
  const pageProps = usePageProps({ props });
  return <div {...pageProps}>{children}</div>;
};

export default memo(PageContent);
