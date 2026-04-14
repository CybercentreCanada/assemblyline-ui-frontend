import { Box } from '@mui/material';
import { memo, type FC, type PropsWithChildren } from 'react';
import { type PageProps } from './hooks/usePageProps';
import { PageContent } from './PageContent';

type PageCenterProps = PropsWithChildren &
  PageProps & {
    maxWidth?: string;
    textAlign?: string;
  };

const PageCenterInternal: FC<PageCenterProps> = ({
  children,
  height,
  width = '95%',
  maxWidth = '1200px',
  textAlign = 'center',
  ...props
}) => {
  return (
    <Box
      component="div"
      height={height}
      width={width}
      maxWidth={maxWidth}
      sx={theme => ({
        height,
        width,
        textAlign,
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto 0 auto',
        maxWidth,
        [theme.breakpoints.down('sm')]: {
          maxWidth: '100%'
        }
      })}
    >
      <PageContent {...props} height="100%">
        {children}
      </PageContent>
    </Box>
  );
};

export const PageCenter = memo(PageCenterInternal);
