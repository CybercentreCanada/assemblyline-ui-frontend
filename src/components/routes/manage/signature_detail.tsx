import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import YoutubeSearchedForIcon from '@material-ui/icons/YoutubeSearchedFor';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import Histogram from 'components/visual/Histogram';
import SignatureStatus from 'components/visual/SignatureStatus';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';

export type Signature = {
  classification: string;
  data: string;
  last_modified: string;
  name: string;
  order: number;
  revision: string;
  signature_id: string;
  source: string;
  state_change_data: string;
  state_change_user: string;
  stats: Statistics;
  status: 'DEPLOYED' | 'NOISY' | 'DISABLED';
  type: string;
};

type Statistics = {
  avg: number;
  min: number;
  max: number;
  count: number;
  sum: number;
};

type ParamProps = {
  id: string;
};

type SignatureDetailProps = {
  signature_id?: string;
  onUpdated?: () => void;
  onDeleted?: () => void;
};

const useStyles = makeStyles(theme => ({
  preview: {
    padding: theme.spacing(2),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  stats: {
    margin: 0,
    padding: `${theme.spacing(0.75)}px ${theme.spacing(1)}px`
  },
  openPaper: {
    maxWidth: '1200px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const SignatureDetail = ({ signature_id, onUpdated, onDeleted }: SignatureDetailProps) => {
  const { t } = useTranslation(['manageSignatureDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [signature, setSignature] = useState<Signature>(null);
  const [stats, setStats] = useState<Statistics>(null);
  const [histogram, setHistogram] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [modified, setModified] = useState(false);
  const history = useHistory();
  const { showSuccessMessage } = useMySnackbar();
  const apiCall = useMyAPI();
  const classes = useStyles();
  const { user: currentUser, c12nDef } = useALContext();

  useEffect(() => {
    if (signature_id || id) {
      apiCall({
        url: `/api/v4/signature/${signature_id || id}/`,
        onSuccess: api_data => {
          setSignature(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature_id, id]);

  useEffect(() => {
    if (signature) {
      if (!signature.stats) {
        apiCall({
          method: 'POST',
          url: '/api/v4/search/stats/result/result.score/',
          body: { query: `result.sections.tags.file.rule.${signature.type}:"${signature.source}.${signature.name}"` },
          onSuccess: api_data => {
            setStats(api_data.api_response);
          }
        });
      }
      apiCall({
        method: 'POST',
        url: '/api/v4/search/histogram/result/created/',
        body: {
          query: `result.sections.tags.file.rule.${signature.type}:"${signature.source}.${signature.name}"`,
          mincount: 0,
          start: 'now-30d',
          end: 'now',
          gap: '+1d'
        },
        onSuccess: api_data => {
          const chartData = {
            labels: Object.keys(api_data.api_response).map((key: string) => key.replace('T00:00:00.000Z', '')),
            datasets: [
              {
                label: signature_id || id,
                data: Object.values(api_data.api_response)
              }
            ]
          };
          setHistogram(chartData);
        }
      });
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
      url: `/api/v4/signature/change_status/${signature_id || id}/${signature.status}/`,
      onSuccess: () => {
        showSuccessMessage(t('change.success'));
        setModified(false);
        onUpdated();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  const handleExecuteDeleteButtonClick = () => {
    closeDialog();
    apiCall({
      url: `/api/v4/signature/${signature_id || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        if (id) setTimeout(() => history.push('/manage/signatures'), 1000);
        onDeleted();
      }
    });
  };

  const handleDeleteButtonClick = () => {
    setDeleteDialog(true);
  };

  return (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={handleExecuteDeleteButtonClick}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
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
            <Select fullWidth onChange={handleSelectChange} variant="outlined" margin="dense" value={signature.status}>
              <MenuItem value="DEPLOYED">{t('status.DEPLOYED')}</MenuItem>
              <MenuItem value="NOISY">{t('status.NOISY')}</MenuItem>
              <MenuItem value="DISABLED">{t('status.DISABLED')}</MenuItem>
            </Select>
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
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification size="tiny" c12n={signature ? signature.classification : null} />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <Grid container alignItems="center" spacing={4}>
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
            <Typography variant="caption">
              {signature ? (
                `${signature.type}_${signature.source}_${signature.signature_id}`
              ) : (
                <Skeleton style={{ width: '10rem' }} />
              )}
            </Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
            {signature ? (
              <>
                <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
                  <Tooltip title={t('usage')}>
                    <IconButton
                      component={Link}
                      style={{ color: theme.palette.action.active }}
                      to={`/search/result/?query=result.sections.tags.file.rule.${signature.type}:"${signature.source}.${signature.name}"`}
                    >
                      <YoutubeSearchedForIcon />
                    </IconButton>
                  </Tooltip>
                  {(currentUser.is_admin || currentUser.roles.indexOf('signature_manager') !== -1) && (
                    <Tooltip title={t('remove')}>
                      <IconButton
                        style={{
                          color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                        }}
                        onClick={handleDeleteButtonClick}
                      >
                        <RemoveCircleOutlineOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
                <SignatureStatus
                  status={signature.status}
                  onClick={
                    currentUser.is_admin || currentUser.roles.indexOf('signature_manager') !== -1
                      ? () => setOpen(true)
                      : null
                  }
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
                  height="1rem"
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
          <Grid item xs={12}>
            {signature ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {signature.data}
              </Paper>
            ) : (
              <Skeleton variant="rect" height="6rem" />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('section_stat_contrib')}</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('count')}</Typography>
                {signature && (stats || signature.stats) ? (
                  <Paper component="pre" variant="outlined" className={classes.stats}>
                    {stats ? stats.count : signature.stats.count}
                  </Paper>
                ) : (
                  <Skeleton variant="rect" style={{ height: '28.px' }} />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('min')}</Typography>
                {signature && (stats || signature.stats) ? (
                  <Paper component="pre" variant="outlined" className={classes.stats}>
                    {stats ? stats.min || 0 : signature.stats.min || 0}
                  </Paper>
                ) : (
                  <Skeleton variant="rect" style={{ height: '28.px' }} />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('avg')}</Typography>
                {signature && (stats || signature.stats) ? (
                  <Paper component="pre" variant="outlined" className={classes.stats}>
                    {stats ? stats.avg || 0 : signature.stats.avg || 0}
                  </Paper>
                ) : (
                  <Skeleton variant="rect" style={{ height: '28.px' }} />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('max')}</Typography>
                {signature && (stats || signature.stats) ? (
                  <Paper component="pre" variant="outlined" className={classes.stats}>
                    {stats ? stats.max || 0 : signature.stats.max || 0}
                  </Paper>
                ) : (
                  <Skeleton variant="rect" style={{ height: '28.px' }} />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Histogram data={histogram} height={300} isDate title={t('chart.title')} />
          </Grid>
        </Grid>

        {signature && modified ? (
          <div
            style={{
              paddingTop: id ? theme.spacing(1) : theme.spacing(2),
              paddingBottom: id ? theme.spacing(1) : theme.spacing(2),
              position: id ? 'fixed' : 'inherit',
              bottom: id ? 0 : 'inherit',
              left: id ? 0 : 'inherit',
              width: id ? '100%' : 'inherit',
              textAlign: id ? 'center' : 'right',
              zIndex: id ? theme.zIndex.drawer - 1 : 'auto',
              backgroundColor: id ? theme.palette.background.default : 'inherit',
              boxShadow: id ? theme.shadows[4] : 'inherit'
            }}
          >
            <Button variant="contained" color="primary" disabled={buttonLoading} onClick={handleStateSaveButtonClick}>
              {t('change.save')}
              {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          </div>
        ) : null}
      </div>
    </PageCenter>
  );
};

SignatureDetail.defaultProps = {
  signature_id: null,
  onUpdated: () => {},
  onDeleted: () => {}
};

export default SignatureDetail;
