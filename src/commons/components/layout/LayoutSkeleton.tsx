import {
  AppBar,
  Avatar,
  Box,
  BoxProps,
  Divider,
  List,
  makeStyles,
  Toolbar,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import AppsIcon from '@material-ui/icons/Apps';
import Skeleton from '@material-ui/lab/Skeleton';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import { LeftNavElement } from 'commons/components/layout/leftnav/LeftNavDrawer';
import { useStyles as userProfileStyles } from 'commons/components/layout/topnav/UserProfile';
import React from 'react';

/**
 * MaterialUI dynamic style classes for layout skeleton component.
 */
const useStyles = makeStyles(theme => ({
  container: {
    position: 'absolute',
    zIndex: theme.zIndex.appBar + 100,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  toplayout: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  leftlayout: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row'
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    backgroundColor: theme.palette.background.default
  },
  contentLeft: {
    // borderRight: theme.palette.type === "light" ? "1px solid" : 0,
    border: theme.palette.type === 'light' ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: theme.palette.background.paper,
    marginRight: 5,
    flex: '0 0 auto',
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  contentRight: {
    flex: '1 1 auto'
  },
  title: {
    fontSize: '1.5rem',
    letterSpacing: '-1'
  },
  quickSearch: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  breadcrumbs: {
    height: theme.spacing(4),
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  }
}));

/**
 * Default Skeleton component that will render either [TopLayoutSkeleton] or [SideLayoutSkeleton] based on [useAppLayout::currentLayout].
 */
const LayoutSkeleton: React.FC = () => {
  const { currentLayout } = useAppLayout();
  return currentLayout === 'top' ? <TopLayoutSkeleton /> : <SideLayoutSkeleton />;
};

/**
 * A Skeleton for the side layout.
 */
const SideLayoutSkeleton = () => {
  const theme = useTheme();
  const classes = useStyles();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const userProfileClasses = userProfileStyles();
  const { layoutProps, showQuickSearch: _showQuickSearch, breadcrumbsEnabled, drawerState } = useAppLayout();
  const showBreadcrumbs = layoutProps.allowBreadcrumbs && breadcrumbsEnabled;
  const showTopBarBreadcrumbs = showBreadcrumbs && !isSm;
  const showQuicksearch = layoutProps.allowQuickSearch && _showQuickSearch;
  return (
    <Box className={classes.container}>
      <Box className={classes.leftlayout}>
        <Box className={classes.content}>
          <Box className={classes.contentLeft} width={drawerState ? 240 : 57}>
            <Toolbar disableGutters>
              <ButtonSkeleton withText={drawerState} pt={1} pb={1} pl={2} pr={2} flexGrow={1} />
            </Toolbar>
            <Divider />
            <List disablePadding>
              <LeftNavElementsSkeleton elements={layoutProps.leftnav.elements} withText={drawerState} />
              <Divider />
              <ButtonSkeleton withText={drawerState} pt={1} pb={1} pl={2} pr={2} />
            </List>
          </Box>
          <Box className={classes.contentRight}>
            <AppBar position="relative" elevation={0} style={{ backgroundColor: theme.palette.background.default }}>
              <Toolbar disableGutters style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(3) }}>
                {isXs ? <ButtonSkeleton withText={drawerState} pt={1} pb={1} pl={2} pr={2} flexGrow={1} /> : null}
                {showTopBarBreadcrumbs ? (
                  <Skeleton variant="text" animation="wave" width={100} className={classes.breadcrumbs} />
                ) : null}
                {showTopBarBreadcrumbs ? <Box flexGrow={1} /> : null}
                {showQuicksearch ? (
                  <Skeleton
                    variant="text"
                    animation="wave"
                    width={showTopBarBreadcrumbs ? 300 : 'auto'}
                    style={{ flexGrow: !showTopBarBreadcrumbs ? 1 : 0 }}
                    className={classes.quickSearch}
                  />
                ) : null}
                <ButtonSkeleton withText={false} pt={1} pb={1} pl={2} pr={2} ml={1} mr={1} />
                <Skeleton animation="wave" variant="circle">
                  <Avatar className={userProfileClasses.iconButton} />
                </Skeleton>
              </Toolbar>
            </AppBar>
            {showBreadcrumbs && isSm ? (
              <Skeleton
                style={{ marginLeft: theme.spacing(2) }}
                variant="text"
                animation="wave"
                width={100}
                className={classes.breadcrumbs}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * A Skeleton for the top layout.
 */
const TopLayoutSkeleton = () => {
  const theme = useTheme();
  const classes = useStyles();
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const userProfileClasses = userProfileStyles();
  const { layoutProps, showQuickSearch: _showQuickSearch, breadcrumbsEnabled, drawerState } = useAppLayout();
  const showBreadcrumbs = layoutProps.allowBreadcrumbs && breadcrumbsEnabled;
  const showTopBarBreadcrumbs = showBreadcrumbs && !isSm;
  const showQuicksearch = layoutProps.allowQuickSearch && _showQuickSearch;
  return (
    <Box className={classes.container}>
      <Box className={classes.toplayout}>
        <AppBar position="relative" elevation={2} style={{ backgroundColor: theme.palette.background.default }}>
          <Toolbar style={{ paddingRight: theme.spacing(3) }} disableGutters>
            <ButtonSkeleton withText={false} pt={1} pb={1} pl={2} pr={2} />
            <Skeleton variant="text" animation="wave" style={{ marginRight: theme.spacing(3) }}>
              <Box fontSize="1.5rem" letterSpacing="-1px">
                {layoutProps.appName}
              </Box>
            </Skeleton>
            {showTopBarBreadcrumbs ? (
              <Skeleton variant="text" animation="wave" width={100} className={classes.breadcrumbs} />
            ) : null}
            {showTopBarBreadcrumbs && !isSm ? <Box flexGrow={1} /> : null}
            {showQuicksearch ? (
              <Skeleton
                variant="text"
                animation="wave"
                width={showTopBarBreadcrumbs ? 300 : 'auto'}
                style={{ flexGrow: !showTopBarBreadcrumbs ? 1 : 0 }}
                className={classes.quickSearch}
              />
            ) : null}
            <ButtonSkeleton withText={false} pt={1} pb={1} pl={2} pr={2} ml={1} mr={1} />
            <Skeleton animation="wave" variant="circle">
              <Avatar className={userProfileClasses.iconButton} />
            </Skeleton>
          </Toolbar>
        </AppBar>
        <Box className={classes.content}>
          <Box className={classes.contentLeft} width={drawerState ? 240 : 57}>
            <List disablePadding>
              <LeftNavElementsSkeleton elements={layoutProps.leftnav.elements} withText={drawerState} />
              <Divider />
              <ButtonSkeleton withText={drawerState} pt={1} pb={1} pl={2} pr={2} />
            </List>
          </Box>
          <Box className={classes.contentRight}>
            {showBreadcrumbs && isSm ? (
              <Skeleton
                style={{ marginLeft: theme.spacing(2), marginTop: theme.spacing(1) }}
                variant="text"
                animation="wave"
                width={100}
                className={classes.breadcrumbs}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Utility component to render the  skeleton of the left navigation menu elements.
 *
 * The
 *
 * The specified properties are simply passed down to each child [ButtonSkeleton] component.
 *
 * @param props
 */
interface LeftNavElementsSkeletonProps extends BoxProps {
  // eslint-disable-next-line react/require-default-props
  withText?: boolean;
  elements: LeftNavElement[];
}
const LeftNavElementsSkeleton = (props: LeftNavElementsSkeletonProps) => {
  const { elements, ...boxProps } = props;
  return (
    <>
      {elements.map((element, i) => {
        if (element.type === 'divider') {
          return <Divider key={`leftnav-sklt-divider-${i}`} />;
        }
        return <ButtonSkeleton {...boxProps} pt={1} pb={1} pl={2} pr={2} key={`leftnav-sklt-${element.element.id}`} />;
      })}
    </>
  );
};

/**
 * Skeleton component for a button.
 *
 * Properties:
 *  This component will simply destructure the properties to the wrapping MUI Box component.
 *  Therefore you can specify any properties support by that component.
 *  - withText: indicates wether to add a text skeleton on the left of the icon skeleton.
 *
 * @param props
 */
interface ButtonSkeletonProps extends BoxProps {
  // eslint-disable-next-line react/require-default-props
  withText?: boolean;
}
const ButtonSkeleton = (props: ButtonSkeletonProps) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const { withText, ...boxProps } = props;
  return (
    <Box height={48} display="flex" flexDirection="row" {...boxProps}>
      <Skeleton variant="text" animation="wave">
        <AppsIcon />
      </Skeleton>
      {withText ? (
        <Skeleton
          variant="text"
          animation="wave"
          style={{ flexGrow: 1, marginLeft: isXs ? theme.spacing(2) : theme.spacing(4) }}
        />
      ) : null}
    </Box>
  );
};

// Default exported component
export default LayoutSkeleton;
