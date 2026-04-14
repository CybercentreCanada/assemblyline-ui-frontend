import { memo, type FC, type PropsWithChildren } from 'react';
import { usePageProps, type PageProps } from './hooks/usePageProps';

type PageContentProps = PropsWithChildren & PageProps;

const PageContentInternal: FC<PageContentProps> = ({ children, ...props }) => {
  const pageProps = usePageProps({ props });
  return <div {...pageProps}>{children}</div>;
};

export const PageContent = memo(PageContentInternal);
