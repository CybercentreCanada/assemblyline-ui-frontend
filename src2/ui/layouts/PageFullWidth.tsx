import { BoxProps, styled } from '@mui/material';
import React from 'react';
import { PageContent } from './PageContent';

export const PageFullWidth = React.memo(styled(PageContent)(() => ({ width: '100%' }))) as React.FC<BoxProps>;

PageFullWidth.displayName = 'PageFullWidth';
