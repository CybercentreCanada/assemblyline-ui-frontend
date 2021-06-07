import { Divider, Grid, IconButton, Tooltip, Typography, useTheme } from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import Histogram from 'components/visual/Histogram';
import { bytesToSize } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useHistory, useParams } from 'react-router-dom';

export type Whitelist = {
  added: string;
  classification: string;
  fileinfo: {
    md5: string;
    sha1: string;
    sha256: string;
    size: number;
    type: 'user' | 'external';
  };
  id: string;
  sources: {
    name: string;
    type: string;
    reason: string[];
  }[];
  updated: string;
};

type ParamProps = {
  id: string;
};

type WhitelistDetailProps = {
  whitelist_id?: string;
  close?: () => void;
};

const WhitelistDetail = ({ whitelist_id, close }: WhitelistDetailProps) => {
  const { t, i18n } = useTranslation(['manageWhitelistDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [whitelist, setWhitelist] = useState<Whitelist>(null);
  const [histogram, setHistogram] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { c12nDef } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const apiCall = useMyAPI();
  const history = useHistory();

  useEffect(() => {
    if (whitelist_id || id) {
      apiCall({
        url: `/api/v4/whitelist/${whitelist_id || id}/`,
        onSuccess: api_data => {
          setWhitelist(api_data.api_response);
        }
      });
      apiCall({
        method: 'POST',
        url: '/api/v4/search/histogram/result/created/',
        body: {
          query: `response.service_name:Whitelist AND id:${whitelist_id || id}*`,
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
                label: whitelist_id || id,
                data: Object.values(api_data.api_response)
              }
            ]
          };
          setHistogram(chartData);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whitelist_id, id]);

  const removeWhitelist = () => {
    apiCall({
      url: `/api/v4/whitelist/${whitelist_id || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        setDeleteDialog(false);
        showSuccessMessage(t('delete.success'));
        if (id) {
          setTimeout(() => history.push('/manage/whitelist'), 1000);
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWhitelists')), 1000);
        close();
      }
    });
  };

  return (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={removeWhitelist}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification type="outlined" c12n={whitelist ? whitelist.classification : null} />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t('title')}</Typography>
              <Typography variant="caption">
                {whitelist ? whitelist.fileinfo.sha256 : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
            {(whitelist_id || id) && (
              <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
                {whitelist ? (
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
                ) : (
                  <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                )}
              </Grid>
            )}
          </Grid>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">{t('fileinfo')}</Typography>
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
                {whitelist ? (
                  whitelist.fileinfo.md5 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
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
                {whitelist ? (
                  whitelist.fileinfo.sha1 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
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
                {whitelist ? (
                  whitelist.fileinfo.sha256 || (
                    <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('size')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {whitelist ? (
                  whitelist.fileinfo.size ? (
                    <span>
                      {whitelist.fileinfo.size}
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(whitelist.fileinfo.size)})</span>
                    </span>
                  ) : (
                    <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('type')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                {whitelist ? (
                  whitelist.fileinfo.type || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{t('sources')}</Typography>
            <Divider />
            {whitelist ? (
              whitelist.sources.map(src => (
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
                {whitelist ? (
                  <div>
                    <Moment format="YYYY-MM-DD">{whitelist.added}</Moment>&nbsp; (
                    <Moment fromNow locale={i18n.language}>
                      {whitelist.added}
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
                {whitelist ? (
                  <div>
                    <Moment format="YYYY-MM-DD">{whitelist.updated}</Moment>&nbsp; (
                    <Moment fromNow locale={i18n.language}>
                      {whitelist.updated}
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

WhitelistDetail.defaultProps = {
  whitelist_id: null,
  close: () => {}
};

export default WhitelistDetail;
