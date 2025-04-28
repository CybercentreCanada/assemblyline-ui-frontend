import Editor, { loader } from '@monaco-editor/react';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useAppTheme } from 'commons/components/app/hooks';
import PageCenter from 'commons/components/pages/PageCenter';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Signature } from 'components/models/base/signature';
import type { Statistic } from 'components/models/base/statistic';
import { DEFAULT_STATS } from 'components/models/base/statistic';
import ForbiddenPage from 'components/routes/403';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import Histogram from 'components/visual/Histogram';
import { PageHeader as ALPageHeader } from 'components/visual/Layouts/PageHeader';
import Moment from 'components/visual/Moment';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import ResultsTable from 'components/visual/SearchResult/results';
import SignatureStatus from 'components/visual/SignatureStatus';
import { suricataConfig, suricataDef } from 'helpers/suricata';
import { safeFieldValue, safeFieldValueURI } from 'helpers/utils';
import { yaraConfig, yaraDef } from 'helpers/yara';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbUserX } from 'react-icons/tb';
import { Link, useNavigate, useParams } from 'react-router';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const LANG_SELECTOR = {
  yara: 'yara',
  suricata: 'suricata',
  configextractor: 'python',
  sigma: 'yaml',
  tagcheck: 'yara'
};

type SaveSignatureProps = {
  signature: Signature;
  modified: boolean;
  handleSuccess: () => void;
};

const SaveSignature: React.FC<SaveSignatureProps> = React.memo(
  ({ signature = null, modified = false, handleSuccess = () => null }) => {
    const { t } = useTranslation(['manageSignatureDetail']);
    const { id, type, source, name } = useParams<ParamProps>();
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useALContext();
    const { showSuccessMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleStateSaveButtonClick = useCallback(() => {
      apiCall({
        url: `/api/v4/signature/change_status/${signature.id}/${signature.status}/`,
        onSuccess: () => {
          showSuccessMessage(t('change.success'));
          handleSuccess();
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSuccess, signature?.id, signature?.status, t]);

    if (!currentUser.roles.includes('signature_manage') || !signature || !modified) return null;
    else
      return (
        <>
          <div
            style={{
              paddingTop: id || (type && source && name) ? theme.spacing(1) : theme.spacing(2),
              paddingBottom: id || (type && source && name) ? theme.spacing(1) : theme.spacing(2),
              position: id || (type && source && name) ? 'fixed' : 'inherit',
              bottom: id || (type && source && name) ? 0 : 'inherit',
              left: id || (type && source && name) ? 0 : 'inherit',
              width: id || (type && source && name) ? '100%' : 'inherit',
              textAlign: id || (type && source && name) ? 'center' : 'right',
              zIndex: id || (type && source && name) ? theme.zIndex.drawer - 1 : 'auto',
              backgroundColor: id || (type && source && name) ? theme.palette.background.default : 'inherit',
              boxShadow: id || (type && source && name) ? theme.shadows[4] : 'inherit'
            }}
          >
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
              {t('change.save')}
            </Button>
          </div>
          <ConfirmationDialog
            open={open}
            waiting={loading}
            handleClose={() => setOpen(false)}
            handleCancel={() => setOpen(false)}
            handleAccept={handleStateSaveButtonClick}
            title={t('save.title')}
            cancelText={t('cancel')}
            acceptText={t('save.acceptText')}
            text={t('save.text')}
          />
        </>
      );
  }
);

type ResetSignatureToSourceProps = {
  signature: Signature;
  onSignatureChange?: (signature: Partial<Signature>) => void;
};

const ResetSignatureToSource: React.FC<ResetSignatureToSourceProps> = React.memo(
  ({ signature = null, onSignatureChange = () => null }) => {
    const { t } = useTranslation(['manageSignatureDetail']);
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useALContext();
    const { showSuccessMessage } = useMySnackbar();

    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleResetSignatureToSource = useCallback(() => {
      if (!currentUser.roles.includes('signature_manage')) return;
      apiCall({
        url: `/api/v4/signature/clear_status/${signature.id}/`,
        onSuccess: () => {
          showSuccessMessage(t('restore.success'));
          onSignatureChange({ state_change_date: null, state_change_user: null });
          setOpen(false);
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.roles, onSignatureChange, signature.id, t]);

    if (
      !currentUser.roles.includes('signature_manage') ||
      !signature?.state_change_date ||
      !signature?.state_change_user
    )
      return null;
    else
      return (
        <>
          <Tooltip title={t('restore.tooltip')}>
            <IconButton
              size="large"
              onClick={() => setOpen(true)}
              style={{ color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark }}
            >
              <TbUserX fontSize="smaller" />
            </IconButton>
          </Tooltip>
          <ConfirmationDialog
            open={open}
            waiting={loading}
            handleClose={() => setOpen(false)}
            handleCancel={() => setOpen(false)}
            handleAccept={handleResetSignatureToSource}
            title={t('restore.title')}
            cancelText={t('cancel')}
            acceptText={t('restore.acceptText')}
            text={t('restore.text')}
          />
        </>
      );
  }
);

type ParamProps = {
  id?: string;
  type?: string;
  source?: string;
  name?: string;
};

type SignatureDetailProps = {
  signature_id?: string;
  onUpdated?: () => void;
  onDeleted?: () => void;
};

const SignatureDetail = ({
  signature_id = null,
  onUpdated = () => null,
  onDeleted = () => null
}: SignatureDetailProps) => {
  const { t, i18n } = useTranslation(['manageSignatureDetail']);
  const { id, type, source, name } = useParams<ParamProps>();
  const theme = useTheme();
  const [signature, setSignature] = useState<Signature>(null);
  const [stats, setStats] = useState<Statistic>(DEFAULT_STATS);
  const [histogram, setHistogram] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [modified, setModified] = useState(false);
  const navigate = useNavigate();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { user: currentUser, c12nDef } = useALContext();
  const { isDark: isDarkTheme } = useAppTheme();
  // const editorRef = useRef(null);

  useEffectOnce(() => {
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  const beforeMount = monaco => {
    // Register Yara language
    monaco.languages.register({ id: 'yara' });
    monaco.languages.setMonarchTokensProvider('yara', yaraDef);
    monaco.languages.setLanguageConfiguration('yara', yaraConfig);

    // Register Suricata language
    monaco.languages.register({ id: 'suricata' });
    monaco.languages.setMonarchTokensProvider('suricata', suricataDef);
    monaco.languages.setLanguageConfiguration('suricata', suricataConfig);
  };

  // const editorMounted = (editor, monaco) => {
  //   editorRef.current = editor;
  // };

  useEffect(() => {
    if ((signature_id || id) && currentUser.roles.includes('signature_view')) {
      apiCall({
        url: `/api/v4/signature/${signature_id || id}/`,
        onSuccess: api_data => {
          setSignature({ id: signature_id || id, ...api_data.api_response });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature_id, id]);

  useEffect(() => {
    if (type && source && name && currentUser.roles.includes('signature_view')) {
      apiCall({
        url: `/api/v4/search/signature/?query=type:${safeFieldValueURI(type)} AND source:${safeFieldValueURI(
          source
        )} AND name:${safeFieldValueURI(name)}&rows=1&fl=id`,
        onSuccess: api_data => {
          if (api_data.api_response.items.length) {
            const sigId = api_data.api_response.items[0].id;
            apiCall({
              url: `/api/v4/signature/${sigId}/`,
              onSuccess: id_api_data => {
                setSignature({ id: sigId, ...id_api_data.api_response });
              }
            });
          } else {
            showErrorMessage(t('not_found'));
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, source, name]);

  useEffect(() => {
    if (signature) {
      if (currentUser.roles.includes('submission_view')) {
        if (!signature.stats) {
          apiCall({
            method: 'POST',
            url: '/api/v4/search/stats/result/result.score/',
            body: {
              query: `result.sections.tags.file.rule.${signature.type}:${safeFieldValue(
                `${signature.source}.${signature.name}`
              )}`
            },
            onSuccess: api_data => {
              setStats(api_data.api_response);
            }
          });
        } else {
          setStats(signature.stats);
        }
        apiCall({
          method: 'POST',
          url: '/api/v4/search/histogram/result/created/',
          body: {
            query: `result.sections.tags.file.rule.${signature.type}:${safeFieldValue(
              `${signature.source}.${signature.name}`
            )}`,
            mincount: 0,
            start: 'now-30d/d',
            end: 'now+1d/d-1s',
            gap: '+1d'
          },
          onSuccess: api_data => {
            setHistogram(api_data.api_response);
          }
        });
        apiCall({
          method: 'GET',
          url: `/api/v4/search/result/?query=result.sections.tags.file.rule.${signature.type}:${safeFieldValueURI(
            `${signature.source}.${signature.name}`
          )}&rows=10`,
          onSuccess: api_data => {
            setResults(api_data.api_response);
          }
        });
      } else if (signature.stats) {
        setStats(signature.stats);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const closeDialog = () => {
    setOpen(false);
  };

  const handleSelectChange = event => {
    setModified(true);
    setSignature({ ...signature, status: event.target.value });
    closeDialog();
  };

  const handleStateSaveButtonClick = () => {
    apiCall({
      url: `/api/v4/signature/change_status/${signature.id}/${signature.status}/`,
      onSuccess: () => {
        showSuccessMessage(t('change.success'));
        setModified(false);
        onUpdated();
        setSignature(s => ({
          ...s,
          state_change_user: currentUser.username,
          state_change_date: new Date(Date.now()).toISOString()
        }));
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const handleExecuteDeleteButtonClick = () => {
    closeDialog();
    apiCall({
      url: `/api/v4/signature/${signature.id}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        if (id) setTimeout(() => navigate('/manage/signatures'), 1000);
        onDeleted();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const handleDeleteButtonClick = () => {
    setDeleteDialog(true);
  };

  return currentUser.roles.includes('signature_view') ? (
    <PageCenter margin={!id && !type && !name && !source ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={handleExecuteDeleteButtonClick}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={buttonLoading}
      />

      <Dialog
        open={open}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('change.title')}</DialogTitle>
        <DialogContent>
          <p>{t('change.warning')}</p>
          <ul>
            <li>{t('change.warning.1')}</li>
            <li>{t('change.warning.2')}</li>
          </ul>
          <div>{t('change.warning.action')}</div>
          {signature ? (
            <FormControl size="small" fullWidth>
              <Select fullWidth onChange={handleSelectChange} variant="outlined" value={signature.status}>
                <MenuItem value="DEPLOYED">{t('status.DEPLOYED')}</MenuItem>
                <MenuItem value="NOISY">{t('status.NOISY')}</MenuItem>
                <MenuItem value="DISABLED">{t('status.DISABLED')}</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Skeleton height={2} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            {t('change.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(3) }}>
          <Classification size="tiny" c12n={signature ? signature.classification : null} />
        </div>
      )}

      <div style={{ textAlign: 'left' }}>
        <ALPageHeader
          primary={t('title')}
          secondary={`${signature?.type}_${signature?.source}_${signature?.signature_id}`}
          loading={!signature}
          style={{ paddingBottom: theme.spacing(2) }}
          endAdornment={
            signature ? (
              <SignatureStatus
                status={signature.status}
                onClick={currentUser.roles.includes('signature_manage') ? () => setOpen(true) : null}
              />
            ) : (
              <Skeleton
                variant="rectangular"
                height="1rem"
                width="6rem"
                style={{
                  marginBottom: theme.spacing(1),
                  marginTop: theme.spacing(1),
                  borderRadius: theme.spacing(1)
                }}
              />
            )
          }
          actions={[
            signature ? (
              <>
                {currentUser.roles.includes('submission_view') && (
                  <Tooltip title={t('usage')}>
                    <IconButton
                      component={Link}
                      style={{ color: theme.palette.action.active }}
                      to={`/search/result/?query=result.sections.tags.file.rule.${signature.type}:${safeFieldValueURI(
                        `${signature.source}.${signature.name}`
                      )}`}
                      size="large"
                    >
                      <YoutubeSearchedForIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <ResetSignatureToSource
                  signature={signature}
                  onSignatureChange={value => setSignature(old => ({ ...old, ...value }))}
                />
                {currentUser.roles.includes('signature_manage') && (
                  <Tooltip title={t('remove')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                      onClick={handleDeleteButtonClick}
                      size="large"
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            ) : (
              <>
                <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
              </>
            )
          ]}
        />

        <Grid container alignItems="center" spacing={2.5}>
          {signature?.state_change_user && signature?.state_change_date && (
            <Grid size={{ xs: 12 }} textAlign="center">
              <Alert severity="info">
                <Typography color="secondary" variant="body2">
                  <b> {signature?.state_change_user}</b>
                  {t('status_modified')}
                  <Moment variant="localeDate">{signature?.state_change_date}</Moment>
                </Typography>
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            {signature ? (
              <div
                style={{
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Editor
                  language={LANG_SELECTOR[signature.type] || 'plaintext'}
                  width="100%"
                  height="450px"
                  theme={isDarkTheme ? 'vs-dark' : 'vs'}
                  loading={t('loading.yara')}
                  value={signature.data}
                  beforeMount={beforeMount}
                  options={{
                    links: false,
                    readOnly: true,
                    minimap: { enabled: false },
                    overviewRulerLanes: 0,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false
                  }}
                />
              </div>
            ) : (
              <Skeleton variant="rectangular" height="6rem" />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">{t('statistics')}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
              {t('hits')}
            </Typography>
            <Grid container size="grow">
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('hit.count')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>{signature && stats ? stats.count : <Skeleton />}</Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('hit.first')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>
                {signature && stats ? (
                  stats.first_hit ? (
                    <Moment variant="fromNow">{stats.first_hit}</Moment>
                  ) : (
                    t('hit.none')
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('hit.last')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>
                {signature && stats ? (
                  stats.last_hit ? (
                    <Moment variant="fromNow">{stats.last_hit}</Moment>
                  ) : (
                    t('hit.none')
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
              {t('contribution')}
            </Typography>
            <Grid container size="grow">
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('score.min')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>{signature && stats ? stats.min : <Skeleton />}</Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('score.avg')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>
                {signature && stats ? Number(stats.avg).toFixed(0) : <Skeleton />}
              </Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('score.max')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>{signature && stats ? stats.max : <Skeleton />}</Grid>
            </Grid>
          </Grid>
          {currentUser.roles.includes('submission_view') && (
            <>
              <Grid size={{ xs: 12 }}>
                <Histogram
                  dataset={histogram}
                  height="250px"
                  isDate
                  title={t('chart.title')}
                  datatype={signature_id || id}
                  verticalLine
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">{t('last10')}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ResultsTable resultResults={results} allowSort={false} />
              </Grid>
            </>
          )}
        </Grid>

        <RouterPrompt when={modified} />

        <SaveSignature
          signature={signature}
          modified={modified}
          handleSuccess={() => {
            setModified(false);
            onUpdated();
            setSignature({
              ...signature,
              state_change_user: currentUser.username,
              state_change_date: new Date(Date.now()).toISOString()
            });
          }}
        />
      </div>
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
};

export default SignatureDetail;
