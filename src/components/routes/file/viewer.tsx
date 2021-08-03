import {
  Grid,
  IconButton,
  LinearProgress,
  Link as MaterialLink,
  makeStyles,
  Paper,
  Tab,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import { Alert, TabContext, TabList, TabPanel } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import getXSRFCookie from 'helpers/xsrf';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

const useStyles = makeStyles(theme => ({
  pre: {
    backgroundColor: theme.palette.type === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    fontSize: '1rem',
    padding: '16px 8px',
    margin: '0.25rem 0',
    overflow: 'auto',
    wordBreak: 'break-word'
  },
  no_pad: {
    padding: 0
  }
}));

const WrappedAsciiViewer = ({ sha256 }) => {
  const [ascii, setAscii] = useState(null);
  const [error, setError] = useState(null);
  const classes = useStyles();
  const apiCall = useMyAPI();

  useEffect(() => {
    apiCall({
      url: `/api/v4/file/ascii/${sha256}/`,
      onSuccess: api_data => {
        setAscii(api_data.api_response);
        if (error !== null) setError(null);
      },
      onFailure: api_data => {
        if (ascii !== null) setAscii(null);
        setError(api_data.api_error_message);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  return ascii ? (
    <pre className={classes.pre}>{ascii}</pre>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const WrappedHexViewer = ({ sha256 }) => {
  const [hex, setHex] = useState(null);
  const [error, setError] = useState(null);
  const classes = useStyles();
  const apiCall = useMyAPI();

  useEffect(() => {
    apiCall({
      url: `/api/v4/file/hex/${sha256}/`,
      onSuccess: api_data => {
        if (error !== null) setError(null);
        setHex(api_data.api_response);
      },
      onFailure: api_data => {
        setError(api_data.api_error_message);
        if (hex !== null) setHex(null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  return hex ? (
    <pre className={classes.pre}>
      <div style={{ minWidth: '580px' }}>{hex}</div>
    </pre>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const WrappedStringViewer = ({ sha256 }) => {
  const [string, setString] = useState(null);
  const [error, setError] = useState(null);
  const classes = useStyles();
  const apiCall = useMyAPI();

  useEffect(() => {
    apiCall({
      url: `/api/v4/file/strings/${sha256}/`,
      onSuccess: api_data => {
        if (error !== null) setError(null);
        setString(api_data.api_response);
      },
      onFailure: api_data => {
        setError(api_data.api_error_message);
        if (string !== null) setString(null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  return string ? (
    <pre className={classes.pre}>{string}</pre>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const AsciiViewer = React.memo(WrappedAsciiViewer);
const HexViewer = React.memo(WrappedHexViewer);
const StringViewer = React.memo(WrappedStringViewer);

const FileViewer = () => {
  const { id } = useParams<ParamProps>();
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const history = useHistory();
  const [tab, setTab] = useState('ascii');

  const handleChangeTab = (event, newTab) => {
    const currentTab = location.hash.substring(1, location.hash.length) || 'ascii';
    if (currentTab !== newTab) {
      history.push(`${location.pathname}#${newTab}`);
    }
  };

  useEffect(() => {
    const newTab = location.hash.substring(1, location.hash.length) || 'ascii';
    setTab(newTab);
  }, [location.hash]);

  return (
    <PageCenter margin={4} width="100%" textAlign="left">
      <Grid container alignItems="center">
        <Grid item xs sm={8}>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
            {id}
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <div style={{ textAlign: 'right' }}>
            <Tooltip title={t('detail')}>
              <IconButton component={Link} to={`/file/detail/${id}`}>
                <DescriptionOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('related')}>
              <IconButton component={Link} to={`/search/submission?query=files.sha256:${id} OR results:${id}*`}>
                <AmpStoriesOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('download')}>
              <IconButton component={MaterialLink} href={`/api/v4/file/download/${id}/?XSRF_TOKEN=${getXSRFCookie()}`}>
                <GetAppOutlinedIcon color="action" />
              </IconButton>
            </Tooltip>
          </div>
        </Grid>
      </Grid>

      <TabContext value={tab}>
        <Paper square style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(2) }}>
          <TabList onChange={handleChangeTab} indicatorColor="primary" textColor="primary">
            <Tab label={t('ascii')} value="ascii" />
            <Tab label={t('strings')} value="strings" />
            <Tab label={t('hex')} value="hex" />
          </TabList>
        </Paper>
        <TabPanel value="ascii" className={classes.no_pad}>
          <AsciiViewer sha256={id} />
        </TabPanel>
        <TabPanel value="strings" className={classes.no_pad}>
          <StringViewer sha256={id} />
        </TabPanel>
        <TabPanel value="hex" className={classes.no_pad}>
          <HexViewer sha256={id} />
        </TabPanel>
      </TabContext>
    </PageCenter>
  );
};

export default FileViewer;
