import AssistantOutlinedIcon from '@mui/icons-material/AssistantOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Alert, Button, CircularProgress, Grid, LinearProgress, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AIMarkdown from '../AiMarkdown';
import MonacoEditor, { LANGUAGE_SELECTOR } from '../MonacoEditor';

const useStyles = makeStyles(theme => ({
  aiButton: {
    height: '100%',
    minWidth: theme.spacing(6),
    padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
    borderColor: theme.palette.divider,
    borderRadius: 0,
    alignItems: 'flex-start',
    borderLeftWidth: '0px'
  },
  code: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFF',
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary,
    padding: theme.spacing(2),
    textAlign: 'left',
    whiteSpace: 'normal',
    overflowY: 'auto',
    borderLeftWidth: '0px',
    wordBreak: 'break-word',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0
  },
  spinner: {
    textAlign: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  watermark: {
    float: 'right',
    color: theme.palette.text.disabled,
    fontSize: 'smaller',
    cursor: 'pointer'
  }
}));

type Props = {
  sha256: string;
  type?: string;
  codeAllowed?: boolean;
  archiveOnly?: boolean;
};

const WrappedASCIISection: React.FC<Props> = ({
  sha256,
  type: propType = null,
  codeAllowed = false,
  archiveOnly = false
}) => {
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { t, i18n } = useTranslation(['fileViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const [analysing, setAnalysing] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [codeSummary, setCodeSummary] = useState(null);
  const [codeTruncated, setCodeTruncated] = useState(false);
  const [showCodeSummary, setShowCodeSummary] = useState(false);

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [data, setData] = useState<string>(null);
  const [error, setError] = useState<string>(null);

  const type = useMemo<string>(() => (propType && propType in LANGUAGE_SELECTOR ? propType : 'unknown'), [propType]);

  const getCodeSummary = useCallback(
    noCache => {
      const params = [`lang=${i18n.language === 'en' ? 'english' : 'french'}`];
      if (noCache) {
        params.push('no_cache');
      }
      if (archiveOnly) {
        params.push('archive_only');
      }
      apiCall({
        allowCache: !noCache,
        url: `/api/v4/file/code_summary/${sha256}/${params ? `?${params.join('&')}` : ''}`,
        onSuccess: api_data => {
          if (codeError !== null) setCodeError(null);
          setCodeSummary(api_data.api_response.content);
          setCodeTruncated(api_data.api_response.truncated);
        },
        onFailure: api_data => {
          setCodeError(api_data.api_error_message);
          if (codeSummary !== null) {
            setCodeSummary(null);
            setCodeTruncated(false);
          }
        },
        onEnter: () => setAnalysing(true),
        onExit: () => setAnalysing(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeSummary, codeError, sha256]
  );

  useEffect(() => {
    if (!sha256 || data) return;
    apiCall({
      url: `/api/v4/file/ascii/${sha256}/`,
      allowCache: true,
      onEnter: () => {
        setData(null);
        setError(null);
      },
      onSuccess: api_data => setData(api_data.api_response),
      onFailure: api_data => setError(api_data.api_error_message)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sha256]);

  useEffect(() => {
    if (showCodeSummary && !codeSummary && !codeError && !analysing) {
      getCodeSummary(false);
    }
  }, [analysing, codeError, codeSummary, getCodeSummary, showCodeSummary]);

  useEffect(() => {
    return () => {
      setData(null);
      setError(null);
      setCodeError(null);
      setCodeSummary(null);
      setCodeTruncated(false);
    };
  }, [sha256]);

  if (!currentUser.roles.includes('file_detail')) return <ForbiddenPage />;
  else if (error) return <Alert severity="error">{error}</Alert>;
  else if (!data) return <LinearProgress />;
  else
    return (
      <Grid container style={{ flexGrow: 1 }}>
        <Grid item flexGrow={1} style={{ display: 'flex' }}>
          <MonacoEditor
            value={data}
            language={LANGUAGE_SELECTOR[type]}
            options={{ links: false, readOnly: true, beautify: true }}
          />
        </Grid>
        {codeAllowed && isMdUp && (
          <>
            <Grid item flexGrow={showCodeSummary ? 0.5 : 0}>
              <div style={{ position: 'relative', height: '100%' }}>
                {showCodeSummary && (
                  <div className={classes.code}>
                    <div style={{ flexGrow: 1, marginTop: !analysing && !codeError ? theme.spacing(-2) : null }}>
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
                        <AIMarkdown markdown={codeSummary} truncated={codeTruncated} />
                      )}
                    </div>
                    {!analysing && (codeSummary || codeError) && (
                      <div>
                        <Tooltip title={t('powered_by_ai.tooltip')} placement="top-end">
                          <div className={classes.watermark} onClick={() => getCodeSummary(true)}>
                            {t('powered_by_ai')}
                          </div>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Grid>
            <Grid item style={{ minWidth: theme.spacing(6), height: '100%' }}>
              <Tooltip title={t(`${showCodeSummary ? 'hide' : 'show'}_analyse_code`)} placement="top">
                <Button
                  onClick={() => setShowCodeSummary(!showCodeSummary)}
                  variant="outlined"
                  className={classes.aiButton}
                  color="inherit"
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <AssistantOutlinedIcon color="action" />
                    <div style={{ paddingTop: theme.spacing(2) }}>
                      {showCodeSummary ? <ChevronRightIcon color="action" /> : <ChevronLeftIcon color="action" />}
                    </div>
                  </div>
                </Button>
              </Tooltip>
            </Grid>
          </>
        )}
      </Grid>
    );
};

export const ASCIISection = React.memo(WrappedASCIISection);
export default ASCIISection;
