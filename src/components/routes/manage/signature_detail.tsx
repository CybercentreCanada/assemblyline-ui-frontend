import {
  Button,
  Drawer,
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
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import YoutubeSearchedForIcon from '@material-ui/icons/YoutubeSearchedFor';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
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
  status: 'DEPLOYED' | 'NOISY' | 'DISABLED';
  type: string;
};

type ParamProps = {
  id: string;
};

const useStyles = makeStyles(theme => ({
  preview: {
    padding: theme.spacing(2),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  drawerPaper: {
    maxWidth: '1200px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}));

export default function SignatureDetail() {
  const { t } = useTranslation(['manageSignatureDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [signature, setSignature] = useState<Signature>(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [changing, setChanging] = useState(false);
  const history = useHistory();
  const { showSuccessMessage } = useMySnackbar();
  const apiCall = useMyAPI();
  const classes = useStyles();

  useEffect(() => {
    apiCall({
      url: `/api/v4/signature/${id}/`,
      onSuccess: api_data => {
        setSignature(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const closeDrawer = () => {
    setDrawer(false);
    setTempStatus(null);
    setChanging(false);
  };

  const handleSelectChange = event => {
    setTempStatus(event.target.value);
  };

  const handleStateSaveButtonClick = () => {
    setChanging(true);
    apiCall({
      url: `/api/v4/signature/change_status/${id}/${tempStatus}/`,
      onSuccess: api_data => {
        setSignature({ ...signature, status: tempStatus });
        closeDrawer();
        showSuccessMessage(t('change.success'));
      }
    });
  };

  const handleExecuteDeleteButtonClick = event => {
    apiCall({
      url: `/api/v4/signature/${id}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        history.push('/manage/signatures');
      }
    });
  };

  const handleDeleteButtonClick = event => {
    setDeleteDialog(true);
  };

  return (
    <PageCenter margin={4}>
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={handleExecuteDeleteButtonClick}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />

      <Drawer anchor="right" classes={{ paper: classes.drawerPaper }} open={drawer} onClose={closeDrawer}>
        <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
          <IconButton onClick={closeDrawer}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
          <div>
            <Typography variant="h5">{t('change.title')}</Typography>
            <p>{t('change.warning')}</p>
            <ul>
              <li>{t('change.warning.1')}</li>
              <li>{t('change.warning.2')}</li>
            </ul>
            <div>{t('change.warning.action')}</div>
            <Grid container alignItems="center">
              <Grid item xs>
                {signature ? (
                  <Select
                    onChange={handleSelectChange}
                    variant="outlined"
                    margin="dense"
                    value={tempStatus || signature.status}
                  >
                    <MenuItem value="DEPLOYED">{t('status.DEPLOYED')}</MenuItem>
                    <MenuItem value="NOISY">{t('status.NOISY')}</MenuItem>
                    <MenuItem value="DISABLED">{t('status.DISABLED')}</MenuItem>
                  </Select>
                ) : (
                  <Skeleton height={2} />
                )}
              </Grid>
              <Grid item xs style={{ textAlign: 'right' }}>
                <Button
                  disabled={tempStatus === null || changing}
                  variant="contained"
                  color="primary"
                  onClick={handleStateSaveButtonClick}
                >
                  {t('change.save')}
                </Button>
              </Grid>
            </Grid>
          </div>
        </div>
      </Drawer>
      <div style={{ paddingBottom: theme.spacing(4), paddingTop: theme.spacing(2) }}>
        <Classification size="tiny" c12n={signature ? signature.classification : null} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <Grid container alignItems="center">
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
                <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
                  <Tooltip title={t('usage')}>
                    <IconButton
                      component={Link}
                      style={{ color: theme.palette.action.active }}
                      to={`/search/result/?query=result.sections.tags.file.rule.suricata:"${signature.source}.${signature.name}"`}
                    >
                      <YoutubeSearchedForIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('remove')}>
                    <IconButton style={{ color: theme.palette.action.active }} onClick={handleDeleteButtonClick}>
                      <ClearOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <SignatureStatus status={signature.status} onClick={() => setDrawer(true)} />
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
        </Grid>
        {signature ? (
          <Paper component="pre" variant="outlined" className={classes.preview}>
            {signature.data}
          </Paper>
        ) : (
          <Skeleton variant="rect" height="6rem" />
        )}
      </div>
    </PageCenter>
  );
}
