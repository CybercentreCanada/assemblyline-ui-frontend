import { memo, type ReactNode } from 'react';
import usePageProps, { type PageProps } from 'deprecated/legacy/commons/components/pages/hooks/usePageProps';

type PageContentProps = PageProps & {
  children?: ReactNode;
};

const PageContent = ({ children, ...props }: PageContentProps) => {
  const pageProps = usePageProps({ props });
  return <div {...pageProps}>{children}</div>;
};

export default memo(PageContent);
