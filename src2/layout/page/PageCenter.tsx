import { Box, BoxProps, styled } from '@mui/material';
import React, { memo } from 'react';

type PageCenterProps = PageProps & {
  children: React.ReactNode;
  maxWidth?: string;
  textAlign?: string;
};

const PageCenter2 = ({
  children,
  height,
  width = '95%',
  maxWidth = '1200px',
  textAlign = 'center',
  ...props
}: PageCenterProps) => {
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
        marginInline: 'auto',
        paddingInline: theme.spacing(2),
        maxWidth,
        [theme.breakpoints.down('sm')]: {
          maxWidth: '100%',
          paddingInline: theme.spacing(1.5)
        }
      })}
    >
      <PageContent {...props} height="100%">
        {children}
      </PageContent>
    </Box>
  );
};

export default memo(PageCenter2);

export const PageCenter = React.memo(
  styled(Box)(({ theme }) => ({
    width: '95%',
    maxWidth: '1200px',
    textAlign: 'center'
  }))
) as React.FC<BoxProps>;

PageCenter.displayName = 'PageCenter';
