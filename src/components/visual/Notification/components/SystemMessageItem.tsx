import { IconButton, makeStyles, SvgIcon, Typography, useTheme } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import { SystemMessageDefinition } from 'components/hooks/useMyUser';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '..';

const useStyles = () =>
  makeStyles(theme => ({
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: theme.spacing(1)
    },
    title: {
      // whiteSpace: 'nowrap',
      // overflow: 'hidden',
      // textOverflow: 'ellipsis',
      fontWeight: 500
    },
    titleLink: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
      '&:hover': {
        color: theme.palette.type === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
      }
    },
    description: {
      // overflow: 'hidden',
      // display: '-webkit-box',
      // '-webkit-line-clamp': 3,
      // '-webkit-box-orient': 'vertical'
    },
    action: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly'
    },
    popper: {
      zIndex: theme.zIndex.drawer + 2,
      minWidth: '500px',
      [theme.breakpoints.down('sm')]: { minWidth: '320px' },
      [theme.breakpoints.down('xs')]: { minWidth: '250px' }
    },
    margin: {
      margin: theme.spacing(1)
    },
    message: {
      width: '100%'
    },
    user: {
      textAlign: 'right',
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
    icon: { marginLeft: theme.spacing(1.5) },
    iconError: { color: theme.palette.error.main },
    iconWarning: { color: theme.palette.warning.main },
    iconInfo: { color: blue[500] },
    iconSuccess: { color: theme.palette.success.main },

    bar: {
      height: '100%',
      width: theme.spacing(0.5),
      marginLeft: theme.spacing(1)
      // marginRight: theme.spacing(1),
      // backgroundColor: 'initial'
    },
    barError: { backgroundColor: theme.palette.error.main },
    barWarning: { backgroundColor: theme.palette.warning.main },
    barInfo: { backgroundColor: blue[500] },
    barSuccess: { backgroundColor: theme.palette.success.main },
    bgError: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(24, 6, 5)' : 'rgb(253, 236, 234)' },
    bgWarning: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(25, 15, 0)' : 'rgb(255, 244, 229)' },
    bgInfo: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(3, 14, 24)' : 'rgb(232, 244, 253)' },
    bgSuccess: { backgroundColor: theme.palette.type === 'dark' ? 'rgb(7, 17, 7)' : 'rgb(237, 247, 237)' },
    // barInfo: { backgroundColor: theme.palette.getContrastText(theme.palette.primary.main) },
    // barInfo: { /*backgroundColor: theme.palette.info.main,*/ '&.MuiAlert-standardInfo': {} },
    // barWarning: { backgroundColor: theme.palette.warning.main },
    // barSuccess: { backgroundColor: theme.palette.success.main },
    // barError: { backgroundColor: theme.palette.error.main },
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
    textError: { color: theme.palette.type === 'dark' ? 'rgb(250, 179, 174)' : 'rgb(97, 26, 21)' },
    textWarning: { color: theme.palette.type === 'dark' ? 'rgb(255, 213, 153)' : 'rgb(102, 60, 0)' },
    textInfo: { color: theme.palette.type === 'dark' ? 'rgb(166, 213, 250)' : 'rgb(13, 60, 97)' },
    textSuccess: { color: theme.palette.type === 'dark' ? 'rgb(183, 223, 185)' : 'rgb(30, 70, 32)' },
    contrastError: {
      color: theme.palette.getContrastText(theme.palette.error.main)
    },
    contrastWarning: {
      color: theme.palette.getContrastText(theme.palette.warning.main)
    },
    contrastInfo: {
      color: theme.palette.getContrastText(theme.palette.primary.main)
    },
    contrastSuccess: {
      color: theme.palette.getContrastText(theme.palette.success.main)
    }
  }))();

type Props = {};

export const WrappedSystemMessageItem = ({}: Props) => {
  const classes = useStyles();
  const theme = useTheme();
  const { i18n } = useTranslation('alerts');

  const { systemMessage, setSystemMessage, user: currentUser } = useALContext();

  const { onEditSystemMessage, onDeleteSystemMessage } = useNotification();

  const getIcon = React.useCallback(
    (sm: SystemMessageDefinition) => {
      if (sm === null) return <></>;
      else if (sm.severity === 'error')
        return (
          <SvgIcon className={clsx(classes.icon, classes.iconError)} fontSize="medium">
            <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
          </SvgIcon>
        );
      else if (sm.severity === 'warning')
        return (
          <SvgIcon className={clsx(classes.icon, classes.iconWarning)} fontSize="medium">
            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
          </SvgIcon>
        );
      else if (sm.severity === 'info')
        return (
          <SvgIcon className={clsx(classes.icon, classes.iconInfo)} fontSize="medium">
            <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z" />
          </SvgIcon>
        );
      else if (sm.severity === 'success')
        return (
          <SvgIcon className={clsx(classes.icon, classes.iconSuccess)} fontSize="medium">
            <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" />
          </SvgIcon>
        );
      else return <></>;
    },
    [classes]
  );

  if (systemMessage === null) return null;
  else if (true)
    return (
      <div className={clsx(classes.container)}>
        {getIcon(systemMessage)}
        <div
          className={clsx(
            classes.bar,
            systemMessage.severity === 'error' && classes.barError,
            systemMessage.severity === 'warning' && classes.barWarning,
            systemMessage.severity === 'info' && classes.barInfo,
            systemMessage.severity === 'success' && classes.barSuccess
          )}
        />
        <div className={clsx(classes.content)}>
          <Typography
            className={clsx(
              classes.title,
              systemMessage.severity === 'error' && classes.textError,
              systemMessage.severity === 'warning' && classes.textWarning,
              systemMessage.severity === 'info' && classes.textInfo,
              systemMessage.severity === 'success' && classes.textSuccess
            )}
            variant="body1"
          >
            {systemMessage.title}
          </Typography>
          <Typography className={clsx(classes.description)} variant="body2" color="textPrimary">
            {systemMessage.message}
          </Typography>
          <Typography className={classes.user} variant="caption" color="textSecondary">
            {' - ' + systemMessage.user}
          </Typography>
        </div>
        {currentUser !== null && currentUser.is_admin && (
          <div className={clsx(classes.action)}>
            <IconButton size="small" color="inherit" onClick={onEditSystemMessage}>
              <EditOutlinedIcon />
            </IconButton>
            <div style={{ height: '10px' }} />
            <IconButton size="small" color="inherit" onClick={onDeleteSystemMessage}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </div>
        )}
      </div>
    );
};

export const SystemMessageItem = React.memo(WrappedSystemMessageItem);
export default SystemMessageItem;
