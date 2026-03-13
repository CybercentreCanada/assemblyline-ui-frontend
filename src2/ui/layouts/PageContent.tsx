import { Box, BoxProps, styled } from '@mui/material';
import React from 'react';

export const PageContent = React.memo(
  styled(Box)(({ theme }) => ({
    margin: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      margin: theme.spacing(1)
    }
  }))
) as React.FC<BoxProps>;

PageContent.displayName = 'PageContent';
