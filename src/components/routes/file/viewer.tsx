import {
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import Editor from '@monaco-editor/react';
import { Alert, Skeleton } from '@material-ui/lab';
import PageFullSize from 'commons/components/layout/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import FileDownloader from 'components/visual/FileDownloader';
import Empty from 'components/visual/Empty';
import { HexViewerApp } from 'components/visual/HexViewer';
import ReactResizeDetector from 'react-resize-detector';
import useAppContext from 'commons/components/hooks/useAppContext';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

type ParamProps = {
  id: string;
};

const useStyles = makeStyles(theme => ({
  hexWrapper: {
    backgroundColor: theme.palette.type === 'dark' ? '#1e1e1e' : '#FAFAFA',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%'
  },
  main: {
    marginTop: theme.spacing(1),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  tab: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(2)
  },
  container: {
    flexGrow: 1,
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative'
  },
  innerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
}));

const WrappedMonacoViewer = ({ data, type, error, beautify = false }) => {
  const classes = useStyles();
  const containerEL = useRef<HTMLDivElement>();
  const { isDarkTheme } = useAppContext();

  const beautifyJSON = inputData => {
    if (!beautify) return inputData;

    try {
      return JSON.stringify(JSON.parse(inputData), null, 4);
    } catch {
      return inputData;
    }
  };

  const languageSelector = {
    'text/json': 'json',
    'text/jsons': 'json',
    'code/vbe': 'vb',
    'code/vbs': 'vb',
    'code/wsf': 'xml',
    'code/batch': 'bat',
    'code/ps1': 'powershell',
    'text/ini': 'ini',
    'text/autorun': 'ini',
    'code/java': 'java',
    'code/python': 'python',
    'code/php': 'php',
    'code/shell': 'shell',
    'code/xml': 'xml',
    'code/yaml': 'yaml',
    'code/javascript': 'javascript',
    'code/jscript': 'javascript',
    'code/typescript': 'typescript',
    'code/xfa': 'xml',
    'code/html': 'html',
    'code/hta': 'html',
    'code/html/component': 'html',
    'code/csharp': 'csharp',
    'code/jsp': 'java',
    'code/c': 'cpp',
    'code/h': 'cpp',
    'code/clickonce': 'xml',
    'code/css': 'css',
    'code/markdown': 'markdown',
    'code/sql': 'sql',
    'code/go': 'go',
    'code/ruby': 'ruby',
    'code/perl': 'perl',
    'code/rust': 'rust',
    'code/lisp': 'lisp'
  };

  return data !== null && data !== undefined ? (
    <div ref={containerEL} className={classes.container}>
      <div className={classes.innerContainer}>
        <ReactResizeDetector handleHeight handleWidth targetRef={containerEL}>
          {({ width, height }) => (
            <div ref={containerEL}>
              <Editor
                language={languageSelector[type]}
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                value={beautifyJSON(data)}
                options={{ links: false, readOnly: true }}
              />
            </div>
          )}
        </ReactResizeDetector>
      </div>
    </div>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const WrappedHexViewer = ({ hex, error }) => {
  const classes = useStyles();
  return hex ? (
    <div className={classes.hexWrapper}>
      <HexViewerApp data={hex} />
    </div>
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

const MonacoViewer = React.memo(WrappedMonacoViewer);
const HexViewer = React.memo(WrappedHexViewer);
const ImageViewer = React.memo(WrappedImageViewer);

const FileViewer = () => {
  const { id } = useParams<ParamProps>();
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const history = useHistory();
  const { apiCall } = useMyAPI();
  const [string, setString] = useState(null);
  const [hex, setHex] = useState(null);
  const [ascii, setAscii] = useState(null);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imageAllowed, setImageAllowed] = useState(false);
  const [type, setType] = useState('unknown');
  const [tab, setTab] = useState(null);
  const [sha256, setSha256] = useState(null);
  const { user: currentUser } = useALContext();

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
        setType(api_data.api_response.type);
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

  return currentUser.roles.includes('file_detail') ? (
    <PageFullSize margin={4}>
      <Grid container alignItems="center">
        <Grid item xs>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
            {id}
          </Typography>
        </Grid>
        <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
          <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={t('detail')}>
                <IconButton component={Link} to={`/file/detail/${id}`}>
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={t('related')}>
                <IconButton
                  component={Link}
                  to={`/search/submission?query=files.sha256:${id} OR results:${id}* OR errors:${id}*`}
                >
                  <AmpStoriesOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            {currentUser.roles.includes('file_download') && (
              <FileDownloader
                icon={<GetAppOutlinedIcon />}
                link={`/api/v4/file/download/${id}/`}
                tooltip={t('download')}
              />
            )}
          </div>
        </Grid>
      </Grid>
      {sha256 && tab !== null ? (
        <div className={classes.main}>
          <Paper square style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(1) }}>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={t('ascii')} value="ascii" />
              <Tab label={t('strings')} value="strings" />
              <Tab label={t('hex')} value="hex" />
              {imageAllowed ? <Tab label={t('image')} value="image" /> : <Empty />}
            </Tabs>
          </Paper>

          {tab === 'ascii' && (
            <div className={classes.tab}>
              <MonacoViewer data={ascii} type={type} error={error} beautify />
            </div>
          )}
          {tab === 'strings' && (
            <div className={classes.tab}>
              <MonacoViewer data={string} type={type} error={error} />
            </div>
          )}
          {tab === 'hex' && (
            <div className={classes.tab}>
              <HexViewer hex={hex} error={error} />
            </div>
          )}
          {tab === 'image' && (
            <div className={classes.tab}>
              <ImageViewer image={image} error={error} />{' '}
            </div>
          )}
        </div>
      ) : (
        <Skeleton
          variant="rect"
          height={theme.spacing(6)}
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      )}
    </PageFullSize>
  ) : (
    <ForbiddenPage />
  );
};

export default FileViewer;
