import { Divider, Grid, IconButton, Tooltip, Typography, useTheme } from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import YoutubeSearchedForIcon from '@material-ui/icons/YoutubeSearchedFor';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import CustomChip from 'components/visual/CustomChip';
import Histogram from 'components/visual/Histogram';
import { bytesToSize } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useHistory, useParams } from 'react-router-dom';

export type Safelist = {
  added: string;
  classification: string;
  enabled: boolean;
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
  const [enableDialog, setEnableDialog] = useState(false);
  const [disableDialog, setDisableDialog] = useState(false);
  const { user: currentUser, c12nDef } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const history = useHistory();

  useEffect(() => {
    if (safelist_id || id) {
      apiCall({
        url: `/api/v4/safelist/${safelist_id || id}/`,
        onSuccess: api_data => {
          setSafelist(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safelist_id, id]);

  useEffect(() => {
    if (safelist) {
      apiCall({
        method: 'POST',
        url: '/api/v4/search/histogram/result/created/',
        body: {
          query:
            safelist.type === 'file'
              ? `result.sections.heuristic.signature.name:"SAFELIST_${safelist_id || id}"`
              : safelist.type === 'signature'
              ? `result.sections.heuristic.signature.name:"${safelist.signature.name}"`
              : `result.sections.safelisted_tags.${safelist.tag.type}:"${safelist.tag.value}"`,
          mincount: 0,
          start: 'now-30d/d',
          end: 'now+1d/d-1s',
          gap: '+1d'
        },
        onSuccess: api_data => {
          const chartData = {
            labels: Object.keys(api_data.api_response).map((key: string) => key.replace('T00:00:00.000Z', '')),
            datasets: [
              {
                label: safelist_id || id,
                data: Object.values(api_data.api_response)
              }
            ]
          };
          setHistogram(chartData);
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
          setTimeout(() => history.push('/manage/safelist'), 1000);
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSafelist')), 1000);
        close();
      }
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
      }
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
      }
    });
  };

  return (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={removeSafelist}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />
      <ConfirmationDialog
        open={enableDialog}
        handleClose={() => setEnableDialog(false)}
        handleAccept={enableHash}
        title={t('enable.title')}
        cancelText={t('enable.cancelText')}
        acceptText={t('enable.acceptText')}
        text={t('enable.text')}
      />
      <ConfirmationDialog
        open={disableDialog}
        handleClose={() => setDisableDialog(false)}
        handleAccept={disableHash}
        title={t('disable.title')}
        cancelText={t('disable.cancelText')}
        acceptText={t('disable.acceptText')}
        text={t('disable.text')}
      />

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification type="outlined" c12n={safelist ? safelist.classification : null} />
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
            <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
              {safelist ? (
                <>
                  <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'center' }}>
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
                            ? `/search/result/?query=result.sections.heuristic.signature.name:"${safelist.signature.name}"`
                            : `/search/result/?query=result.sections.safelisted_tags.${safelist.tag.type}:"${safelist.tag.value}"`
                        }
                      >
                        <YoutubeSearchedForIcon />
                      </IconButton>
                    </Tooltip>
                    {(currentUser.is_admin ||
                      currentUser.roles.indexOf('signature_manager') !== -1 ||
                      safelist.sources.some(elem => elem.name === currentUser.username)) && (
                      <Tooltip title={t('remove')}>
                        <IconButton
                          style={{
                            color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                          }}
                          onClick={() => setDeleteDialog(true)}
                        >
                          <RemoveCircleOutlineOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                  <CustomChip
                    type="rounded"
                    size="small"
                    style={{ width: '6rem' }}
                    color={safelist.enabled ? 'primary' : 'default'}
                    onClick={safelist.enabled ? () => setDisableDialog(true) : () => setEnableDialog(true)}
                    label={safelist.enabled ? t('enabled') : t('disabled')}
                  />
                </>
              ) : (
                <>
                  <div style={{ display: 'flex' }}>
                    <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                    <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                  </div>
                  <Skeleton
                    variant="rect"
                    height="2rem"
                    width="6rem"
                    style={{
                      marginBottom: theme.spacing(1),
                      marginTop: theme.spacing(1),
                      borderRadius: theme.spacing(1)
                    }}
                  />
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
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>MD5</span>
              </Grid>
              <Grid
                item
                xs={8}
                sm={9}
                lg={10}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {safelist ? (
                  safelist.hashes.md5 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>SHA1</span>
              </Grid>
              <Grid
                item
                xs={8}
                sm={9}
                lg={10}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {safelist ? (
                  safelist.hashes.sha1 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>SHA256</span>
              </Grid>
              <Grid
                item
                xs={8}
                sm={9}
                lg={10}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
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
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('file.name')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {safelist ? safelist.file.name.map((name, i) => <div key={i}>{name}</div>) : <Skeleton />}
                </Grid>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('file.size')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {safelist.file.size ? (
                    <span>
                      {safelist.file.size}
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(safelist.file.size)})</span>
                    </span>
                  ) : (
                    <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('file.type')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
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
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('signature.name')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
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
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('tag.type')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {safelist.tag.type}
                </Grid>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('tag.value')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {safelist.tag.value}
                </Grid>
              </Grid>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="h6">{t('sources')}</Typography>
            <Divider />
            {safelist ? (
              safelist.sources.map(src => (
                <Grid key={src.name} container spacing={1}>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>
                      {src.name} ({t(src.type)})
                    </span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {src.reason.map((reason, i) => (
                      <div key={i}>{reason}</div>
                    ))}
                  </Grid>
                </Grid>
              ))
            ) : (
              <Skeleton />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{t('timing')}</Typography>
            <Divider />
            <Grid container>
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('timing.added')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
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
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('timing.updated')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
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
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Histogram data={histogram} height={300} isDate title={t('chart.title')} />
          </Grid>
        </Grid>
      </div>
    </PageCenter>
  );
};

SafelistDetail.defaultProps = {
  safelist_id: null,
  close: () => {}
};

export default SafelistDetail;
