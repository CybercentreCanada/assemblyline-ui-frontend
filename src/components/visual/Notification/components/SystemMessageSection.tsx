import { makeStyles, Typography } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import clsx from 'clsx';
import { CustomUserContextProps } from 'components/hooks/useMyUser';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationEmpty, useNotificationStyles } from '..';

const useStyles = makeStyles(theme => ({
  main: {
    height: '100%',
    width: '100%',
    overflowX: 'hidden',
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid',
    // padding: theme.spacing(2.5),
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5)
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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
  header: {
    width: '100%',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2)
  },
  skeleton: {
    height: '2rem',
    width: '100%'
  },

  title: {
    // whiteSpace: 'nowrap',
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    flex: 1,
    // paddingLeft: theme.spacing(1.5),
    fontWeight: 500
  },
  actionBox: {
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5)
  },
  action: {
    // height: '100%',
    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'space-evenly'
  },
  iconBox: {
    height: 'auto',
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5)
  },
  icon: {
    color: 'inherit',
    backgroundColor: 'inherit'
  },
  description: {
    // overflow: 'hidden',
    // display: '-webkit-box',
    // '-webkit-line-clamp': 3,
    // '-webkit-box-orient': 'vertical'
  },
  user: {
    width: '100%',
    textAlign: 'right',
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },

  divider: {
    width: '100%'
  },

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

  bgColorError3: { color: theme.palette.getContrastText(theme.palette.error.main) },
  bgColorWarning3: { color: theme.palette.getContrastText(theme.palette.warning.main) },
  bgColorInfo3: { color: theme.palette.getContrastText(theme.palette.primary.main) },
  bgColorSuccess3: { color: theme.palette.getContrastText(theme.palette.success.main) }
}));

type Props = {
  alContext: CustomUserContextProps;
};

const WrappedSystemMessageSection: React.FC<Props> = ({ alContext }: Props) => {
  const { classes, getColor } = useNotificationStyles();
  const { t, i18n } = useTranslation(['notification']);

  const { systemMessage } = alContext;

  if (systemMessage === null || systemMessage === undefined)
    return <NotificationEmpty text="There are no system message." />;
  else
    return (
      <div className={clsx(classes.itemContainer)}>
        <Typography className={clsx(classes.systemMessageTitle, getColor(systemMessage, 'color', 2))} variant="body1">
          {systemMessage.title}
        </Typography>
        <Typography variant="body2" color="textPrimary">
          {systemMessage.message}
        </Typography>
        <Typography className={classes.systemMessageUser} variant="caption" color="textSecondary">
          {' - ' + systemMessage.user}
        </Typography>
      </div>
    );
};

export const SystemMessageSection = React.memo(WrappedSystemMessageSection);
export default SystemMessageSection;
