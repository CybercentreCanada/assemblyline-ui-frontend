import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Collapse, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Moment from 'components/visual/Moment';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type Error = {
  archive_ts: string;
  created: string;
  expiry_ts: string | null;
  response: {
    message: string;
    service_debug_info: string;
    service_name: string;
    service_tool_version: string;
    service_version: string;
    status: string;
  };
  sha256: string;
  type: string;
};

type ErrorCardProps = {
  error: Error;
};

const useStyles = makeStyles(theme => ({
  card: {
    backgroundColor: theme.palette.mode === 'dark' ? '#371a1a' : '#fce9e9',
    border: `solid 1px ${theme.palette.mode === 'dark' ? '#502121' : '#ffcbcb'}`,
    borderRadius: '4px'
  },
  card_title: {
    backgroundColor: theme.palette.mode === 'dark' ? '#502121' : '#ffd9d9',
    padding: '6px',
    borderRadius: '4px 4px 0px 0px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? '#6e2b2b' : '#ffc5c5',
      cursor: 'pointer'
    }
  },
  content: {
    fontSize: '1rem',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    whiteSpace: 'pre-wrap'
  },
  muted: {
    color: theme.palette.text.secondary
  }
}));

const ErrorCard: React.FC<ErrorCardProps> = ({ error }) => {
  const classes = useStyles();
  const { t, i18n } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div className={classes.card} style={{ marginBottom: sp2 }}>
      <Box className={classes.card_title} onClick={handleClick}>
        <span>
          <b>{error.response.service_name}</b>&nbsp;
        </span>
        <span>[{t(`type.${error.type}`)}]&nbsp;</span>
        {error.response.service_version !== '0' ? (
          <>
            <small className={classes.muted}>{` :: ${error.response.service_version}`}</small>
            <small className={classes.muted} style={{ flexGrow: 1 }}>
              &nbsp;
              {error.response.service_tool_version && error.response.service_tool_version !== '0'
                ? `(${error.response.service_tool_version})`
                : ''}
            </small>
          </>
        ) : (
          <small style={{ flexGrow: 1 }}></small>
        )}
        <small className={classes.muted}>
          <Moment variant="fromNow">{error.created}</Moment>
        </small>
        {open ? <ExpandLess className={classes.muted} /> : <ExpandMore className={classes.muted} />}
      </Box>
      <Collapse in={open} timeout="auto">
        <pre className={classes.content}>{error.response.message}</pre>
      </Collapse>
    </div>
  );
};

export default ErrorCard;
