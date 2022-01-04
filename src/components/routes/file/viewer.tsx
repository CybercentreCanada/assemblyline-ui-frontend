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
import { Alert, Skeleton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import clsx from 'clsx';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import Empty from 'components/visual/Empty';
import { HexViewerApp } from 'components/visual/HexViewer';
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
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%'
  },
  flexContainer: {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center'
  },
  flexItem: {
    width: '100%',
    maxWidth: '1200px',
    padding: 0
  }
}));

const WrappedAsciiViewer = ({ ascii, error }) => {
  const classes = useStyles();

  return ascii ? (
    <pre className={classes.pre}>{ascii}</pre>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress className={classes.flexItem} />
  );
};

const WrappedHexViewer = ({ hex, error }) => {
  const classes = useStyles();

  return hex ? (
    <pre className={classes.pre}>
      <HexViewerApp data={hex} />
    </pre>
  ) : error ? (
    <div className={clsx(classes.flexContainer)}>
      <Alert className={clsx(classes.flexItem)} severity="error">
        {error}
      </Alert>
    </div>
  ) : (
    <div className={clsx(classes.flexContainer)}>
      <LinearProgress className={clsx(classes.flexItem)} />
    </div>
  );
};

const WrappedStringViewer = ({ string, error }) => {
  const classes = useStyles();

  return string ? (
    <pre className={classes.pre}>{string}</pre>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const WrappedImageViewer = ({ image, error }) => {
  const classes = useStyles();

  return image ? (
    <img className={classes.img} alt={''} src={image} />
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const AsciiViewer = React.memo(WrappedAsciiViewer);
const HexViewer = React.memo(WrappedHexViewer);
const StringViewer = React.memo(WrappedStringViewer);
const ImageViewer = React.memo(WrappedImageViewer);

const FileViewer = () => {
  const { id } = useParams<ParamProps>();
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const history = useHistory();
  const apiCall = useMyAPI();
  const [string, setString] = useState(null);
  const [hex, setHex] = useState(null);
  const [ascii, setAscii] = useState(null);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imageAllowed, setImageAllowed] = useState(false);
  const [tab, setTab] = useState(null);
  const [sha256, setSha256] = useState(null);

  const handleChangeTab = (event, newTab) => {
    const currentTab = location.hash.substring(1, location.hash.length) || 'ascii';
    if (currentTab !== newTab) {
      history.push(`${location.pathname}#${newTab}`);
    }
  };

  useEffect(() => {
    setString(null);
    setHex(null);
    setAscii(null);
    setError(null);
    setImage(null);
    apiCall({
      url: `/api/v4/file/info/${id}/`,
      onSuccess: api_data => {
        const imgAllowed = api_data.api_response.is_section_image === true;
        if (!imgAllowed && tab === 'image') setTab('ascii');
        setImageAllowed(imgAllowed);
        setSha256(id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const newTab = location.hash.substring(1, location.hash.length);
    if (newTab) setTab(newTab);
    else if (tab === null || (!imageAllowed && tab === 'image')) setTab('ascii');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageAllowed, location.hash]);

  useEffect(() => {
    if (!sha256) return;

    setError(null);

    if (tab === 'ascii' && ascii === null) {
      apiCall({
        url: `/api/v4/file/ascii/${sha256}/`,
        onSuccess: api_data => {
          if (error !== null) setError(null);
          setAscii(api_data.api_response);
        },
        onFailure: api_data => {
          setError(api_data.api_error_message);
          if (string !== null) setAscii(null);
        }
      });
    } else if (tab === 'hex' && hex === null) {
      apiCall({
        url: `/api/v4/file/hex/${sha256}/?bytes_only=true`,
        // url: `/api/v4/file/hex/${sha256}/`,
        onSuccess: api_data => {
          if (error !== null) setError(null);
          setHex(api_data.api_response);
        },
        onFailure: api_data => {
          setError(api_data.api_error_message);
          if (hex !== null) setHex(null);
        }
      });
    } else if (tab === 'strings' && string === null) {
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
    } else if (tab === 'image' && image === null) {
      apiCall({
        allowCache: true,
        url: `/api/v4/file/image/${sha256}/`,
        onSuccess: api_data => {
          if (error !== null) setError(null);
          setImage(api_data.api_response);
        },
        onFailure: api_data => {
          setError(api_data.api_error_message);
          if (string !== null) setImage(null);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256, tab]);

  return (
    <PageCenter margin={4} width="100%" textAlign="left" maxWidth="100%">
      <div className={classes.flexContainer}>
        <Grid className={classes.flexItem} container alignItems="center">
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
                <IconButton
                  component={MaterialLink}
                  href={`/api/v4/file/download/${id}/?XSRF_TOKEN=${getXSRFCookie()}`}
                >
                  <GetAppOutlinedIcon color="action" />
                </IconButton>
              </Tooltip>
            </div>
          </Grid>
        </Grid>
      </div>

      {sha256 && tab !== null ? (
        <TabContext value={tab}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Paper
              className={classes.flexItem}
              square
              style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(2) }}
            >
              <TabList onChange={handleChangeTab} indicatorColor="primary" textColor="primary">
                <Tab label={t('ascii')} value="ascii" />
                <Tab label={t('strings')} value="strings" />
                <Tab label={t('hex')} value="hex" />
                {imageAllowed ? <Tab label={t('image')} value="image" /> : <Empty />}
              </TabList>
            </Paper>

            <TabPanel value="ascii" className={clsx(classes.flexItem, classes.no_pad)}>
              <AsciiViewer ascii={ascii} error={error} />
            </TabPanel>
            <TabPanel value="strings" className={clsx(classes.flexItem, classes.no_pad)}>
              <StringViewer string={string} error={error} />
            </TabPanel>
            <TabPanel value="hex" className={clsx(classes.no_pad)} style={{ width: '100%', maxWidth: '100%' }}>
              <HexViewer hex={hex} error={error} />
            </TabPanel>
            {imageAllowed && (
              <TabPanel value="image" className={clsx(classes.flexItem)} style={{ paddingLeft: 0, paddingRight: 0 }}>
                <ImageViewer image={image} error={error} />
              </TabPanel>
            )}
          </div>
        </TabContext>
      ) : (
        <div className={classes.flexContainer}>
          <div className={classes.flexItem} style={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(2) }}>
            <Skeleton variant="rect" height={theme.spacing(6)} />
          </div>
        </div>
      )}
    </PageCenter>
  );
};

export default FileViewer;
