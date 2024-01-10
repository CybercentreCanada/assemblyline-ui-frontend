import { ClearOutlined } from '@mui/icons-material';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import { Divider, Grid, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import DatePicker from 'components/visual/DatePicker';
import Histogram from 'components/visual/Histogram';
import { bytesToSize, safeFieldValue, safeFieldValueURI } from 'helpers/utils';
import 'moment/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { Link, useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

export type Safelist = {
  added: string;
  classification: string;
  enabled: boolean;
  expiry_ts?: string;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
  };
  file: {
    name: string[];
    size: number;
    type: string;
  };
  id: string;
  sources: {
    classification: string;
    name: string;
    reason: string[];
    type: string;
  }[];
  signature: {
    name: string;
  };
  tag: {
    type: string;
    value: string;
  };
  type: string;
  updated: string;
};

type ParamProps = {
  id: string;
};

type SafelistDetailProps = {
  safelist_id?: string;
  close?: () => void;
};

const SafelistDetail = ({ safelist_id, close }: SafelistDetailProps) => {
  const { t, i18n } = useTranslation(['manageSafelistDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [safelist, setSafelist] = useState<Safelist>(null);
  const [histogram, setHistogram] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [waitingDialog, setWaitingDialog] = useState(false);
  const [enableDialog, setEnableDialog] = useState(false);
  const [disableDialog, setDisableDialog] = useState(false);
  const [removeSourceData, setRemoveSourceData] = useState(null);
  const { user: currentUser, c12nDef } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const navigate = useNavigate();

  useEffect(() => {
    if ((safelist_id || id) && currentUser.roles.includes('safelist_view')) {
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safelist_id, id]);

  const reload = () => {
    apiCall({
      url: `/api/v4/safelist/${safelist_id || id}/`,
      onSuccess: api_data => {
        setSafelist(api_data.api_response);
      }
    });
  };

  useEffect(() => {
    if (safelist && currentUser.roles.includes('submission_view')) {
      apiCall({
        method: 'POST',
        url: '/api/v4/search/histogram/result/created/',
        body: {
          query:
            safelist.type === 'file'
              ? `result.sections.heuristic.signature.name:"SAFELIST_${safelist_id || id}"`
              : safelist.type === 'signature'
              ? `result.sections.heuristic.signature.name:${safeFieldValue(safelist.signature.name)}`
              : `result.sections.safelisted_tags.${safelist.tag.type}:${safeFieldValue(safelist.tag.value)}`,
          mincount: 0,
          start: 'now-30d/d',
          end: 'now+1d/d-1s',
          gap: '+1d'
        },
        onSuccess: api_data => {
          setHistogram(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safelist]);

  const removeSafelist = () => {
    apiCall({
      url: `/api/v4/safelist/${safelist_id || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        setDeleteDialog(false);
        showSuccessMessage(t('delete.success'));
        if (id) {
          setTimeout(() => navigate('/manage/safelist'), 1000);
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSafelist')), 1000);
        close();
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  const enableHash = () => {
    apiCall({
      body: true,
      url: `/api/v4/safelist/enable/${safelist_id || id}/`,
      method: 'PUT',
      onSuccess: () => {
        setEnableDialog(false);
        showSuccessMessage(t('enable.success'));
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSafelist')), 1000);
        setSafelist({ ...safelist, enabled: true });
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  const disableHash = () => {
    apiCall({
      body: false,
      url: `/api/v4/safelist/enable/${safelist_id || id}/`,
      method: 'PUT',
      onSuccess: () => {
        setDisableDialog(false);
        showSuccessMessage(t('disable.success'));
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSafelist')), 1000);
        setSafelist({ ...safelist, enabled: false });
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  const handleExpiryDateChange = date => {
    apiCall({
      body: date,
      url: `/api/v4/safelist/expiry/${safelist_id || id}/`,
      method: date ? 'PUT' : 'DELETE',
      onSuccess: () => {
        setDisableDialog(false);
        showSuccessMessage(t(date ? 'expiry.update.success' : 'expiry.clear.success'));
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSafelist')), 1000);
        setSafelist({ ...safelist, expiry_ts: date });
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  const handleClassificationChange = (classification, source, type) => {
    apiCall({
      body: classification,
      url: `/api/v4/safelist/classification/${safelist_id || id}/${source}/${type}/`,
      method: 'PUT',
      onSuccess: () => {
        showSuccessMessage(t('classification.update.success'));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('reloadSafelist'));
          reload();
        }, 1000);
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
  };

  const deleteSource = () => {
    apiCall({
      url: `/api/v4/safelist/source/${safelist_id || id}/${removeSourceData.name}/${removeSourceData.type}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('remove.source.success'));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('reloadSafelist'));
          reload();
        }, 1000);
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => {
        setWaitingDialog(false);
        setRemoveSourceData(null);
      }
    });
  };

  return currentUser.roles.includes('safelist_view') ? (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={removeSafelist}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={waitingDialog}
      />
      <ConfirmationDialog
        open={enableDialog}
        handleClose={() => setEnableDialog(false)}
        handleAccept={enableHash}
        title={t('enable.title')}
        cancelText={t('enable.cancelText')}
        acceptText={t('enable.acceptText')}
        text={t('enable.text')}
        waiting={waitingDialog}
      />
      <ConfirmationDialog
        open={disableDialog}
        handleClose={() => setDisableDialog(false)}
        handleAccept={disableHash}
        title={t('disable.title')}
        cancelText={t('disable.cancelText')}
        acceptText={t('disable.acceptText')}
        text={t('disable.text')}
        waiting={waitingDialog}
      />
      <ConfirmationDialog
        open={removeSourceData !== null}
        handleClose={() => setRemoveSourceData(null)}
        handleAccept={deleteSource}
        title={t('remove.source.title')}
        cancelText={t('remove.source.cancelText')}
        acceptText={t('remove.source.acceptText')}
        text={t('remove.source.text')}
        waiting={waitingDialog}
      />

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification type="outlined" c12n={safelist ? safelist.classification : null} format="long" />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs>
              <Typography variant="h4">{safelist ? t(`title.${safelist.type}`) : t('title')}</Typography>
              <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
                {safelist ? safelist_id || id : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
            <Grid item xs={12} sm style={{ textAlign: 'right', flexGrow: 0 }}>
              {safelist ? (
                <>
                  {(safelist_id || id) && (
                    <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
                      {currentUser.roles.includes('submission_view') && (
                        <Tooltip title={t('usage')}>
                          <IconButton
                            component={Link}
                            style={{ color: theme.palette.action.active }}
                            to={
                              safelist.type === 'file'
                                ? `/search/result/?query=result.sections.heuristic.signature.name:"SAFELIST_${
                                    safelist_id || id
                                  }"`
                                : safelist.type === 'signature'
                                ? `/search/result/?query=result.sections.heuristic.signature.name:${safeFieldValueURI(
                                    safelist.signature.name
                                  )}`
                                : `/search/result/?query=result.sections.safelisted_tags.${
                                    safelist.tag.type
                                  }:${safeFieldValueURI(safelist.tag.value)}`
                            }
                            size="large"
                          >
                            <YoutubeSearchedForIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {currentUser.roles.includes('safelist_manage') && (
                        <Tooltip title={safelist.enabled ? t('enabled') : t('disabled')}>
                          <IconButton
                            onClick={safelist.enabled ? () => setDisableDialog(true) : () => setEnableDialog(true)}
                            size="large"
                          >
                            {safelist.enabled ? <ToggleOnIcon /> : <ToggleOffOutlinedIcon />}
                          </IconButton>
                        </Tooltip>
                      )}

                      {currentUser.roles.includes('safelist_manage') && (
                        <Tooltip title={t('remove')}>
                          <IconButton
                            style={{
                              color:
                                theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                            }}
                            onClick={() => setDeleteDialog(true)}
                            size="large"
                          >
                            <RemoveCircleOutlineOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex' }}>
                    <Skeleton variant="circular" height="3rem" width="3rem" style={{ margin: theme.spacing(0.5) }} />
                    {currentUser.roles.includes('safelist_manage') && (
                      <>
                        <Skeleton
                          variant="circular"
                          height="3rem"
                          width="3rem"
                          style={{ margin: theme.spacing(0.5) }}
                        />
                        <Skeleton
                          variant="circular"
                          height="3rem"
                          width="3rem"
                          style={{ margin: theme.spacing(0.5) }}
                        />
                      </>
                    )}
                  </div>
                </>
              )}
            </Grid>
          </Grid>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} style={{ display: safelist && safelist.type === 'file' ? 'initial' : 'none' }}>
            <Typography variant="h6">{t('hashes')}</Typography>
            <Divider />
            <Grid container>
              <Grid item xs={4} sm={3}>
                <span style={{ fontWeight: 500 }}>MD5</span>
              </Grid>
              <Grid item xs={8} sm={9} style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {safelist ? (
                  safelist.hashes.md5 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid item xs={4} sm={3}>
                <span style={{ fontWeight: 500 }}>SHA1</span>
              </Grid>
              <Grid item xs={8} sm={9} style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {safelist ? (
                  safelist.hashes.sha1 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid item xs={4} sm={3}>
                <span style={{ fontWeight: 500 }}>SHA256</span>
              </Grid>
              <Grid item xs={8} sm={9} style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {safelist ? (
                  safelist.hashes.sha256 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          {safelist && safelist.file && (
            <Grid item xs={12}>
              <Typography variant="h6">{t('file.title')}</Typography>
              <Divider />
              <Grid container>
                <Grid item xs={4} sm={3}>
                  <span style={{ fontWeight: 500 }}>{t('file.name')}</span>
                </Grid>
                <Grid item xs={8} sm={9}>
                  {safelist ? safelist.file.name.map((name, i) => <div key={i}>{name}</div>) : <Skeleton />}
                </Grid>
                <Grid item xs={4} sm={3}>
                  <span style={{ fontWeight: 500 }}>{t('file.size')}</span>
                </Grid>
                <Grid item xs={8} sm={9}>
                  {safelist.file.size ? (
                    <span>
                      {safelist.file.size}
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(safelist.file.size)})</span>
                    </span>
                  ) : (
                    <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                  )}
                </Grid>

                <Grid item xs={4} sm={3}>
                  <span style={{ fontWeight: 500 }}>{t('file.type')}</span>
                </Grid>
                <Grid item xs={8} sm={9} style={{ wordBreak: 'break-word' }}>
                  {safelist.file.type || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>}
                </Grid>
              </Grid>
            </Grid>
          )}
          {safelist && safelist.signature && (
            <Grid item xs={12}>
              <Typography variant="h6">{t('signature.title')}</Typography>
              <Divider />
              <Grid container>
                <Grid item xs={4} sm={3}>
                  <span style={{ fontWeight: 500 }}>{t('signature.name')}</span>
                </Grid>
                <Grid item xs={8} sm={9}>
                  {safelist.signature.name}
                </Grid>
              </Grid>
            </Grid>
          )}
          {safelist && safelist.tag && (
            <Grid item xs={12}>
              <Typography variant="h6">{t('tag.title')}</Typography>
              <Divider />
              <Grid container>
                <Grid item xs={4} sm={3}>
                  <span style={{ fontWeight: 500 }}>{t('tag.type')}</span>
                </Grid>
                <Grid item xs={8} sm={9}>
                  {safelist.tag.type}
                </Grid>
                <Grid item xs={4} sm={3}>
                  <span style={{ fontWeight: 500 }}>{t('tag.value')}</span>
                </Grid>
                <Grid item xs={8} sm={9} style={{ wordBreak: 'break-word' }}>
                  {safelist.tag.value}
                </Grid>
              </Grid>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="h6">{t('sources')}</Typography>
            <Divider />
            {safelist ? (
              safelist.sources.map((src, src_id) => (
                <Grid key={src_id} container>
                  <Grid item xs={12} sm={3}>
                    <span style={{ fontWeight: 500 }}>
                      {src.name} ({t(src.type)})
                      {(currentUser.is_admin || currentUser.username === src.name) && safelist.sources.length !== 1 && (
                        <Tooltip title={t('remove.source.tooltip')}>
                          <IconButton
                            size="small"
                            onClick={() => setRemoveSourceData({ name: src.name, type: src.type })}
                          >
                            <ClearOutlined style={{ fontSize: theme.spacing(2) }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </span>
                  </Grid>
                  <Grid item xs={12} sm={c12nDef.enforce ? 7 : 9}>
                    {src.reason.map((reason, i) => (
                      <div key={i}>{reason}</div>
                    ))}
                  </Grid>
                  {c12nDef.enforce && (
                    <Grid item xs={12} sm={2}>
                      <Classification
                        fullWidth
                        size="small"
                        format="short"
                        c12n={src.classification}
                        type={currentUser.is_admin || currentUser.username === src.name ? 'picker' : 'outlined'}
                        setClassification={
                          currentUser.is_admin || currentUser.username === src.name
                            ? classification => handleClassificationChange(classification, src.name, src.type)
                            : null
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              ))
            ) : (
              <Skeleton />
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container alignItems={'end'}>
              <Grid item xs={11}>
                <Typography variant="h6">{t('timing')}</Typography>
              </Grid>
              <Grid item xs={1} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                {currentUser.roles.includes('safelist_manage') &&
                  (safelist ? (
                    <DatePicker
                      date={safelist.expiry_ts}
                      setDate={handleExpiryDateChange}
                      tooltip={t('expiry.change')}
                      defaultDateOffset={1}
                    />
                  ) : (
                    <Skeleton
                      variant="circular"
                      height="2.5rem"
                      width="2.5rem"
                      style={{ margin: theme.spacing(0.5) }}
                    />
                  ))}
              </Grid>
            </Grid>
            <Divider />
            <Grid container>
              <Grid item xs={4} sm={3}>
                <span style={{ fontWeight: 500 }}>{t('timing.added')}</span>
              </Grid>
              <Grid item xs={8} sm={9}>
                {safelist ? (
                  <div>
                    <Moment format="YYYY-MM-DD">{safelist.added}</Moment>&nbsp; (
                    <Moment fromNow locale={i18n.language}>
                      {safelist.added}
                    </Moment>
                    )
                  </div>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid item xs={4} sm={3}>
                <span style={{ fontWeight: 500 }}>{t('timing.updated')}</span>
              </Grid>
              <Grid item xs={8} sm={9}>
                {safelist ? (
                  <div>
                    <Moment format="YYYY-MM-DD">{safelist.updated}</Moment>&nbsp; (
                    <Moment fromNow locale={i18n.language}>
                      {safelist.updated}
                    </Moment>
                    )
                  </div>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid item xs={4} sm={3}>
                <span style={{ fontWeight: 500 }}>{t('timing.expiry_ts')}</span>
              </Grid>
              <Grid item xs={8} sm={9}>
                {safelist ? (
                  safelist.expiry_ts ? (
                    <div>
                      <Moment format="YYYY-MM-DD">{safelist.expiry_ts}</Moment>&nbsp; (
                      <Moment fromNow locale={i18n.language}>
                        {safelist.expiry_ts}
                      </Moment>
                      )
                    </div>
                  ) : (
                    <span style={{ color: theme.palette.action.disabled }}>{t('expiry.forever')}</span>
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          {currentUser.roles.includes('submission_view') && (
            <Grid item xs={12}>
              <Histogram
                dataset={histogram}
                height="300px"
                isDate
                title={t('chart.title')}
                datatype={safelist_id || id}
                verticalLine
              />
            </Grid>
          )}
        </Grid>
      </div>
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
};

SafelistDetail.defaultProps = {
  safelist_id: null,
  close: () => {}
};

export default SafelistDetail;
