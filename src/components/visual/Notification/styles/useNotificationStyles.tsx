import { makeStyles } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import { SystemMessageDefinition } from 'components/hooks/useMyUser';
import React from 'react';

export const useNotificationStyles = () => {
  const classes = makeStyles(theme => ({
    drawer: {
      width: '80%',
      maxWidth: '500px',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    root: {
      height: '100%',
      width: '100%',
      overflowX: 'hidden',
      pageBreakBefore: 'avoid',
      pageBreakInside: 'avoid',
      padding: theme.spacing(2.5)
    },
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      alignContent: 'stretch',
      flexWrap: 'nowrap'
    },
    row: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      alignContent: 'stretch',
      flexWrap: 'nowrap'
    },
    skeleton: {
      height: '2rem',
      width: '100%'
    },
    divider: {
      width: '100%',
      '@media print': {
        backgroundColor: '#0000001f !important'
      }
    },
    dividerMargin: {
      marginBottom: theme.spacing(2)
    },
    dividerItem: {
      width: '95%'
    },
    empty: {},
    icon: {
      color: 'inherit',
      backgroundColor: 'inherit',
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1.5)
    },
    header: {
      marginTop: theme.spacing(4)
    },
    headerTitle: {
      flex: 1
    },
    itemContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: theme.spacing(1.25),
      paddingBottom: theme.spacing(1.25)
    },
    notificationTitle: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    notificationTitleLink: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
      '&:hover': {
        color: theme.palette.type === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
      }
    },
    notificationDescription: {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 3,
      '-webkit-box-orient': 'vertical'
    },
    systemMessageTitle: { flex: 1, fontWeight: 500 },
    systemMessageUser: {
      textAlign: 'right',
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
    action: {
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5)
    },
    badgeInfo: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.primary.main
    },
    badgeWarning: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.warning.main
    },
    badgeSuccess: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.success.main
    },
    badgeError: {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.error.main
    },
    badge: {},

    colorPrimary: { color: theme.palette.primary.main },

    colorError1: { color: theme.palette.error.main },
    colorWarning1: { color: theme.palette.warning.main },
    colorInfo1: { color: blue[500] },
    colorSuccess1: { color: theme.palette.success.main },

    colorError2: { color: theme.palette.type === 'dark' ? 'rgb(250, 179, 174)' : 'rgb(97, 26, 21)' },
    colorWarning2: { color: theme.palette.type === 'dark' ? 'rgb(255, 213, 153)' : 'rgb(102, 60, 0)' },
    colorInfo2: { color: theme.palette.type === 'dark' ? 'rgb(166, 213, 250)' : 'rgb(13, 60, 97)' },
    colorSuccess2: { color: theme.palette.type === 'dark' ? 'rgb(183, 223, 185)' : 'rgb(30, 70, 32)' },

    colorError3: { color: theme.palette.getContrastText(theme.palette.error.main) },
    colorWarning3: { color: theme.palette.getContrastText(theme.palette.warning.main) },
    colorInfo3: { color: theme.palette.getContrastText(theme.palette.primary.main) },
    colorSuccess3: { color: theme.palette.getContrastText(theme.palette.success.main) },

    bgColorError1: { backgroundColor: theme.palette.error.main },
    bgColorWarning1: { backgroundColor: theme.palette.warning.main },
    bgColorInfo1: { backgroundColor: blue[500] },
    bgColorSuccess1: { backgroundColor: theme.palette.success.main },

    bgColorError2: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(24, 6, 5)' : 'rgb(253, 236, 234)' },
    bgColorWarning2: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(25, 15, 0)' : 'rgb(255, 244, 229)' },
    bgColorInfo2: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(3, 14, 24)' : 'rgb(232, 244, 253)' },
    bgColorSuccess2: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(7, 17, 7)' : 'rgb(237, 247, 237)' },

    bgColorError3: { backgroundColor: theme.palette.getContrastText(theme.palette.error.main) },
    bgColorWarning3: { backgroundColor: theme.palette.getContrastText(theme.palette.warning.main) },
    bgColorInfo3: { backgroundColor: theme.palette.getContrastText(theme.palette.primary.main) },
    bgColorSuccess3: { backgroundColor: theme.palette.getContrastText(theme.palette.success.main) }
  }))();

  const getColor = React.useCallback(
    (sm: SystemMessageDefinition, color: 'color' | 'bgColor' = 'color', type: 1 | 2 | 3 = 1) => {
      if (sm === null || sm === undefined || sm.severity === null) return null;
      const c = classes[color + sm.severity.charAt(0).toUpperCase() + sm.severity.slice(1) + type];
      return c === undefined ? null : c;
    },
    [classes]
  );

  const badgeColorMap = {
    info: classes.badgeInfo,
    success: classes.badgeSuccess,
    warning: classes.badgeWarning,
    error: classes.badgeError
  };

  return { classes, getColor, badgeColorMap };
};
