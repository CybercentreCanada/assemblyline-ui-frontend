import ControlPointDuplicateOutlinedIcon from '@mui/icons-material/ControlPointDuplicateOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import { Grid, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Workflow } from 'components/models/base/workflow';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type RunWorkflowActionProps = {
  id: string;
  workflow: Workflow;
};

export const RunWorkflowAction: React.FC<RunWorkflowActionProps> = React.memo(({ id = null, workflow = null }) => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [dialog, setDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleWorkflowRun = useCallback(() => {
    if (!currentUser.roles.includes('workflow_manage')) return;
    apiCall({
      url: `/api/v4/workflow/${id}/run/`,
      method: 'PUT',
      body: { enabled: true },
      onSuccess: () => {
        setDialog(false);
        showSuccessMessage(t('run.success'));
      },
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, id]);

  if (!id || !currentUser.roles.includes('workflow_manage')) return null;
  else if (!workflow)
    return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
  else
    return (
      <>
        <Tooltip title={t('run.tooltip')}>
          <div>
            <IconButton style={{ color: theme.palette.primary.main }} onClick={() => setDialog(v => !v)} size="large">
              <PlayCircleFilledWhiteOutlinedIcon />
            </IconButton>
          </div>
        </Tooltip>
        <ConfirmationDialog
          open={dialog}
          handleClose={() => setDialog(false)}
          handleAccept={handleWorkflowRun}
          title={t('run.title')}
          cancelText={t('run.cancelText')}
          acceptText={t('run.acceptText')}
          waiting={loading}
          children={
            <Grid container flexDirection="column" rowGap={2} flexWrap="nowrap">
              <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', columnGap: theme.spacing(1) }}>
                <ErrorOutlineOutlinedIcon color="warning" />
                <Typography variant="body1" color="textSecondary" fontStyle="italic">
                  {t('run.text1')}
                </Typography>
              </div>

              <Typography variant="body1" color="textSecondary">
                {t('run.text2')}
              </Typography>

              <Typography variant="body1" color="textSecondary">
                {t('run.text3')}
              </Typography>
            </Grid>
          }
        />
      </>
    );
});

type ShowRelatedAlertsActionProps = {
  id: string;
  workflow: Workflow;
};

export const ShowRelatedAlertsAction: React.FC<ShowRelatedAlertsActionProps> = React.memo(
  ({ id = null, workflow = null }) => {
    const { t } = useTranslation(['manageWorkflowDetail']);
    const theme = useTheme();
    const { user: currentUser } = useALContext();

    if (!id || !currentUser.roles.includes('alert_view')) return null;
    else if (!workflow)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else
      return (
        <Tooltip title={t('usage')}>
          <div>
            <IconButton
              component={Link}
              to={`/alerts/?q=events.entity_id:${id}`}
              size="large"
              style={{ color: theme.palette.action.active }}
            >
              <YoutubeSearchedForIcon />
            </IconButton>
          </div>
        </Tooltip>
      );
  }
);

type DuplicateWorkflowActionProps = {
  id: string;
  workflow: Workflow;
};

export const DuplicateWorkflowAction: React.FC<DuplicateWorkflowActionProps> = React.memo(
  ({ id = null, workflow = null }) => {
    const { t } = useTranslation(['manageWorkflowDetail']);
    const theme = useTheme();
    const { user: currentUser } = useALContext();

    const to = useMemo<string>(() => {
      const query = new URLSearchParams(
        !workflow
          ? ''
          : [
              ['classification', `${workflow.classification}`],
              ['enabled', `${workflow.enabled}`],
              ...workflow.labels.map(label => ['labels', `${label}`]),
              ['name', `${workflow.name}`],
              ['priority', `${workflow.priority}`],
              ['query', `${workflow.query}`],
              ['status', `${workflow.status}`]
            ]
      );
      return `${location.pathname}${location.search}#/create/?${query.toString()}`;
    }, [workflow]);

    if (!id || !currentUser.roles.includes('workflow_manage')) return null;
    else if (!workflow)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else
      return (
        <Tooltip title={t('duplicate')}>
          <div>
            <IconButton style={{ color: theme.palette.success.main }} component={Link} to={to} size="large">
              <ControlPointDuplicateOutlinedIcon />
            </IconButton>
          </div>
        </Tooltip>
      );
  }
);

type EditWorkflowActionProps = {
  id: string;
  workflow: Workflow;
};

export const EditWorkflowAction: React.FC<EditWorkflowActionProps> = React.memo(({ id = null, workflow = null }) => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const theme = useTheme();
  const { user: currentUser } = useALContext();

  if (!id || !currentUser.roles.includes('workflow_manage')) return null;
  else if (!workflow)
    return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
  else
    return (
      <Tooltip title={t('edit')}>
        <div>
          <IconButton
            style={{ color: theme.palette.primary.main }}
            component={Link}
            to={`${location.pathname}${location.search}#/create/${id}`}
            size="large"
          >
            <EditOutlinedIcon />
          </IconButton>
        </div>
      </Tooltip>
    );
});

type EnableWorkflowActionProps = {
  id: string;
  workflow: Workflow;
  onChange: (enabled: boolean) => void;
};

export const EnableWorkflowAction: React.FC<EnableWorkflowActionProps> = React.memo(
  ({ id = null, workflow = null, onChange = () => null }) => {
    const { t } = useTranslation(['manageWorkflowDetail']);
    const theme = useTheme();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useALContext();
    const { showSuccessMessage } = useMySnackbar();

    const [enableDialog, setEnableDialog] = useState<boolean>(false);
    const [disableDialog, setDisableDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleWorkflowEnable = useCallback(() => {
      if (!currentUser.roles.includes('workflow_manage')) return;
      apiCall({
        url: `/api/v4/workflow/enable/${id}/`,
        method: 'PUT',
        body: { enabled: true },
        onSuccess: () => {
          setEnableDialog(false);
          showSuccessMessage(t('enable.success'));
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
          onChange(true);
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.roles, id, onChange]);

    const handleWorkflowDisable = useCallback(() => {
      if (!currentUser.roles.includes('workflow_manage')) return;
      apiCall({
        url: `/api/v4/workflow/enable/${id}/`,
        method: 'PUT',
        body: { enabled: false },
        onSuccess: () => {
          setDisableDialog(false);
          showSuccessMessage(t('disable.success'));
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
          onChange(false);
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.roles, id, onChange]);

    if (!id || !currentUser.roles.includes('workflow_manage')) return null;
    else if (!workflow)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else
      return (
        <>
          <Tooltip title={workflow.enabled ? t('enabled') : t('disabled')}>
            <div>
              <IconButton
                style={{ color: theme.palette.text.primary }}
                onClick={workflow.enabled ? () => setDisableDialog(true) : () => setEnableDialog(true)}
                size="large"
              >
                {workflow.enabled ? <ToggleOnIcon /> : <ToggleOffOutlinedIcon />}
              </IconButton>
            </div>
          </Tooltip>
          <ConfirmationDialog
            open={disableDialog}
            handleClose={() => setDisableDialog(false)}
            handleAccept={handleWorkflowDisable}
            title={t('disable.title')}
            cancelText={t('disable.cancelText')}
            acceptText={t('disable.acceptText')}
            text={t('disable.text')}
            waiting={loading}
          />
          <ConfirmationDialog
            open={enableDialog}
            handleClose={() => setEnableDialog(false)}
            handleAccept={handleWorkflowEnable}
            title={t('enable.title')}
            cancelText={t('enable.cancelText')}
            acceptText={t('enable.acceptText')}
            text={t('enable.text')}
            waiting={loading}
          />
        </>
      );
  }
);

type DeleteWorkflowActionProps = {
  id: string;
  workflow: Workflow;
};

export const DeleteWorkflowAction: React.FC<DeleteWorkflowActionProps> = React.memo(
  ({ id = null, workflow = null }) => {
    const { t } = useTranslation(['manageWorkflowDetail']);
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { apiCall } = useMyAPI();
    const { user: currentUser } = useALContext();
    const { showSuccessMessage } = useMySnackbar();

    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleRemoveWorkflow = useCallback(() => {
      if (!currentUser.roles.includes('workflow_manage')) return;
      apiCall({
        url: `/api/v4/workflow/${id}/`,
        method: 'DELETE',
        onSuccess: () => {
          setDeleteDialog(false);
          showSuccessMessage(t('delete.success'));
          navigate(`/manage/workflows${location.search}`);
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
        },
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser.roles, id, location.search]);

    if (!id || !currentUser.roles.includes('workflow_manage')) return null;
    else if (!workflow)
      return <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />;
    else
      return (
        <>
          <Tooltip title={t('remove')}>
            <div>
              <IconButton
                style={{ color: theme.palette.error.main }}
                onClick={() => setDeleteDialog(true)}
                size="large"
              >
                <RemoveCircleOutlineOutlinedIcon />
              </IconButton>
            </div>
          </Tooltip>
          <ConfirmationDialog
            open={deleteDialog}
            handleClose={() => setDeleteDialog(false)}
            handleAccept={handleRemoveWorkflow}
            title={t('delete.title')}
            cancelText={t('delete.cancelText')}
            acceptText={t('delete.acceptText')}
            text={t('delete.text')}
            waiting={loading}
          />
        </>
      );
  }
);
