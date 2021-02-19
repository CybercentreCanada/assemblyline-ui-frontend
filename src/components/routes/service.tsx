import { Grid, IconButton, Tooltip, Typography, useTheme } from '@material-ui/core';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory, useParams } from 'react-router-dom';

type ServiceProps = {
  name?: string | null;
  onDeleted?: () => void;
};

type ParamProps = {
  svc: string;
};

function Service({ name, onDeleted }: ServiceProps) {
  const { svc } = useParams<ParamProps>();
  const { t } = useTranslation(['service']);
  const [service, setService] = useState(null);
  const theme = useTheme();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const history = useHistory();

  const apiCall = useMyAPI();

  const closeDialog = () => {
    setDeleteDialog(false);
  };

  const handleExecuteDeleteButtonClick = () => {
    closeDialog();
    apiCall({
      url: `/api/v4/service/${name || svc}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        if (svc) setTimeout(() => history.push('/admin/services'), 1000);
        onDeleted();
      }
    });
  };

  const handleDeleteButtonClick = () => {
    setDeleteDialog(true);
  };

  useEffect(() => {
    // Load user on start
    if (currentUser.is_admin) {
      apiCall({
        url: `/api/v4/service/${name || svc}/`,
        onSuccess: api_data => {
          setService(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return !currentUser.is_admin ? (
    <Redirect to="/forbidden" />
  ) : (
    <PageCenter margin={!svc ? 2 : 4} width="100%">
      <div style={{ textAlign: 'left' }}>
        <ConfirmationDialog
          open={deleteDialog}
          handleClose={() => setDeleteDialog(false)}
          handleAccept={handleExecuteDeleteButtonClick}
          title={t('delete.title')}
          cancelText={t('delete.cancelText')}
          acceptText={t('delete.acceptText')}
          text={t('delete.text')}
        />
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
            <Typography variant="caption">{service ? name : <Skeleton style={{ width: '10rem' }} />}</Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
            {service ? (
              <>
                <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
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
                </div>
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

        {service && JSON.stringify(service)}
      </div>
    </PageCenter>
  );
}

Service.defaultProps = {
  name: null,
  onDeleted: () => null
};

export default Service;
