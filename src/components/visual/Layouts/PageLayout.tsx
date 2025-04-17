import { styled, useTheme } from '@mui/material';
import React from 'react';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  overflowY: 'auto'
}));

const Wrapper = styled('div')(({ theme }) => ({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  height: 'fit-content'
}));

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '1200px'
}));

const Navigation = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '0px',
  overflowX: 'hidden',
  overflowY: 'scroll',
  scrollbarWidth: 'none',
  minWidth: 'fit-content'
}));

const Header = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: -1,
  zIndex: 1000,
  backgroundColor: theme.palette.background.default,
  paddingBottom: theme.spacing(1),
  margin: theme.spacing(4),
  marginBottom: 0
}));

const Content = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
  padding: '1px',
  margin: theme.spacing(4),
  marginTop: 0
}));

export type PageLayoutProps = {
  header?: React.ReactNode;
  children?: React.ReactNode;
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
  rootRef?: React.MutableRefObject<HTMLDivElement>;
  contentRef?: React.MutableRefObject<HTMLDivElement>;
  headerRef?: React.MutableRefObject<HTMLDivElement>;
  margin?: number;
};

export const PageLayout: React.FC<PageLayoutProps> = React.memo(
  ({
    header = null,
    children = null,
    leftNav = null,
    rightNav = null,
    rootRef = null,
    contentRef = null,
    headerRef = null,
    margin = 0
  }: PageLayoutProps) => {
    const theme = useTheme();

    return (
      <Root ref={rootRef}>
        {!leftNav ? null : <Navigation>{leftNav}</Navigation>}

        <Wrapper>
          <Container>
            <Header ref={headerRef}>{header}</Header>
            <Content ref={contentRef}>
              {children}

              <div style={{ height: window.innerHeight / 2 }} />
            </Content>
          </Container>
        </Wrapper>

        {!rightNav ? null : <Navigation>{rightNav}</Navigation>}
      </Root>
    );
  }
);
