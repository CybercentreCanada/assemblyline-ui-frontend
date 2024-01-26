import Editor, { loader } from '@monaco-editor/react';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import {
  Alert,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Tab as MuiTab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import { ImageViewer } from 'components/routes/file/image';
import AIMarkdown from 'components/visual/AiMarkdown';
import Empty from 'components/visual/Empty';
import FileDownloader from 'components/visual/FileDownloader';
import { HexViewerApp } from 'components/visual/HexViewer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactResizeDetector from 'react-resize-detector';
import { useNavigate } from 'react-router';
import { Link, useLocation, useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const useStyles = makeStyles(theme => ({
  hexWrapper: {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FAFAFA',
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
  },
  code: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFF',
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary,
    padding: '16px 8px',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    overflowY: 'auto',
    height: '100%',
    maxHeight: '100%',
    whiteSpaceCollapse: 'collapse',
    borderLeftWidth: '0px'
  },
  spinner: {
    textAlign: 'center',
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  watermark: {
    textAlign: 'right',
    color: theme.palette.text.disabled,
    fontSize: 'smaller'
  }
}));

export type Tab = 'ascii' | 'code' | 'strings' | 'hex' | 'image';

export const TAB_OPTIONS: Tab[] = ['ascii', 'code', 'strings', 'hex', 'image'];

export const DEFAULT_TAB: Tab = 'ascii';

type ParamProps = {
  id: string;
  tab: Tab;
};

const WrappedMonacoViewer = ({ data, type, error, beautify = false }) => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const containerEL = useRef<HTMLDivElement>();
  const { isDark: isDarkTheme } = useAppTheme();

  useEffectOnce(() => {
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

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

const WrappedImageContainer = ({ name, image = null, error }) => {
  const classes = useStyles();

  return image ? (
    <div className={classes.hexWrapper} style={{ height: 0 }}>
      <ImageViewer src={image} alt={name} />
    </div>
  ) : error ? (
    <Alert severity="error">{error}</Alert>
  ) : (
    <LinearProgress />
  );
};

const MonacoViewer = React.memo(WrappedMonacoViewer);
const HexViewer = React.memo(WrappedHexViewer);
const ImageContainer = React.memo(WrappedImageContainer);

const FileViewer = () => {
  const { id, tab: paramTab } = useParams<ParamProps>();
  const { t } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const [string, setString] = useState(null);
  const [hex, setHex] = useState(null);
  const [ascii, setAscii] = useState(null);
  const [error, setError] = useState(null);
  const [codeError, setCodeError] = useState(null);
  const [image, setImage] = useState(null);
  const [codeSummary, setCodeSummary] = useState(null);
  const [imageAllowed, setImageAllowed] = useState(false);
  const [codeAllowed, setCodeAllowed] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [type, setType] = useState('unknown');
  const [sha256, setSha256] = useState(null);
  const { user: currentUser } = useAppUser<CustomUser>();
  const { configuration } = useALContext();

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const tab = useMemo(
    () =>
      sha256 && (!paramTab || !TAB_OPTIONS.includes(paramTab) || (!imageAllowed && paramTab === 'image'))
        ? DEFAULT_TAB
        : paramTab,
    [imageAllowed, paramTab, sha256]
  );

  const handleChangeTab = useCallback(
    (event, newTab) => {
      if (tab !== newTab && TAB_OPTIONS.includes(newTab))
        navigate(`/file/viewer/${id}/${newTab}/${location.search}${location.hash}`, { replace: true });
    },
    [id, location.hash, location.search, navigate, tab]
  );

  const getCodeSummary = useCallback(() => {
    apiCall({
      allowCache: true,
      url: `/api/v4/file/code_summary/${sha256}/`,
      onSuccess: api_data => {
        if (codeError !== null) setCodeError(null);
        setCodeSummary(api_data.api_response);
      },
      onFailure: api_data => {
        setCodeError(api_data.api_error_message);
        if (codeSummary !== null) setCodeSummary(null);
      },
      onEnter: () => setAnalysing(true),
      onExit: () => setAnalysing(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeSummary, codeError, sha256]);

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
        setImageAllowed(imgAllowed);
        setType(api_data.api_response.type);
        if (api_data.api_response.type.indexOf('code/') === 0) {
          setCodeAllowed(configuration.ui.ai.enabled);
        } else {
          setCodeAllowed(false);
        }
        setSha256(id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    } else if (tab === 'code' && codeSummary === null) {
      getCodeSummary();
    } else if (tab === 'hex' && hex === null) {
      apiCall({
        url: `/api/v4/file/hex/${sha256}/?bytes_only=true`,
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

  useEffect(() => {
    if (paramTab !== tab) {
      navigate(`/file/viewer/${id}/${tab}/${location.search}${location.hash}`);
    }
  }, [id, location.hash, location.search, navigate, paramTab, tab]);

  return currentUser.roles.includes('file_detail') ? (
    <PageFullSize margin={4}>
      <Grid container alignItems="center">
        <Grid item xs>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
            {id}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={4} style={{ textAlign: 'right', flexGrow: 0 }}>
          <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={t('detail')}>
                <IconButton component={Link} to={`/file/detail/${id}`} size="large">
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            {currentUser.roles.includes('submission_view') && (
              <Tooltip title={t('related')}>
                <IconButton
                  component={Link}
                  to={`/search/submission?query=files.sha256:${id} OR results:${id}* OR errors:${id}*`}
                  size="large"
                >
                  <ViewCarouselOutlinedIcon />
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
              <MuiTab label={t('ascii')} value="ascii" />
              {codeAllowed && !isMdUp ? <MuiTab label={t('code_summary')} value="code" /> : <Empty />}
              <MuiTab label={t('strings')} value="strings" />
              <MuiTab label={t('hex')} value="hex" />
              {imageAllowed ? <MuiTab label={t('image')} value="image" /> : <Empty />}
            </Tabs>
          </Paper>

          {tab === 'ascii' && (
            <div className={classes.tab}>
              <Grid container style={{ flexGrow: 1 }}>
                <Grid item xs={12} md={codeAllowed && isMdUp ? 8 : 12} style={{ display: 'flex' }}>
                  <MonacoViewer data={ascii} type={type} error={error} beautify />
                </Grid>
                {codeAllowed && isMdUp && (
                  <Grid item xs={12} md={4}>
                    <div className={classes.code}>
                      <Button onClick={() => getCodeSummary()} variant="outlined" fullWidth color="inherit">
                        {t('analyse_code')}
                      </Button>
                      <div style={{ flexGrow: 1 }}>
                        {analysing ? (
                          <div className={classes.spinner}>
                            <div style={{ paddingBottom: theme.spacing(2) }}>{t('analysing_code')}</div>
                            <CircularProgress variant="indeterminate" />
                          </div>
                        ) : codeError ? (
                          <Alert severity="error" style={{ marginTop: theme.spacing(2) }}>
                            {codeError}
                          </Alert>
                        ) : (
                          <AIMarkdown markdown={codeSummary} />
                        )}
                      </div>
                      <div className={classes.watermark}>{t('powered_by_ai')}</div>
                    </div>
                  </Grid>
                )}
              </Grid>
            </div>
          )}
          {tab === 'code' && !isMdUp && (
            <div className={classes.tab}>
              {codeSummary !== null && codeSummary !== undefined ? (
                <AIMarkdown markdown={codeSummary} />
              ) : codeError ? (
                <Alert severity="error">{codeError}</Alert>
              ) : (
                <LinearProgress />
              )}
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
              <ImageContainer name={sha256} image={image} error={error} />
            </div>
          )}
        </div>
      ) : (
        <Skeleton
          variant="rectangular"
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
