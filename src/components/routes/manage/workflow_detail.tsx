import {
  Button,
  CircularProgress,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme,
  withStyles
} from '@material-ui/core';
import RemoveOutlinedIcon from '@material-ui/icons/RemoveOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import ChipInput from 'material-ui-chip-input';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

export type Workflow = {
  classification: string;
  creation_date?: number;
  creator?: string;
  edited_by?: string;
  hit_count: number;
  labels: string[];
  last_edit?: string;
  last_seen?: string;
  name: string;
  priority: string;
  query: string;
  status: string;
  workflow_id?: string;
};

type ParamProps = {
  id: string;
};

type WorkflowDetailProps = {
  workflow_id?: string;
  close?: () => void;
};

const MyMenuItem = withStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '48px'
    }
  })
)(MenuItem);

const useStyles = makeStyles(theme => ({
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const WorkflowDetail = ({ workflow_id, close }: WorkflowDetailProps) => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [workflow, setWorkflow] = useState<Workflow>(null);
  const [modified, setModified] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { c12nDef } = useAppContext();
  const { showSuccessMessage } = useMySnackbar();
  const apiCall = useMyAPI();
  const classes = useStyles();
  const history = useHistory();

  const DEFAULT_WORKFLOW = {
    classification: c12nDef.UNRESTRICTED,
    hit_count: 0,
    labels: [],
    name: '',
    priority: '',
    query: '',
    status: ''
  };

  useEffect(() => {
    if (workflow_id || id) {
      apiCall({
        url: `/api/v4/workflow/${workflow_id || id}/`,
        onSuccess: api_data => {
          setWorkflow({
            ...api_data.api_response,
            status: api_data.api_response.status || '',
            priority: api_data.api_response.priority || ''
          });
        }
      });
    } else {
      setWorkflow({ ...DEFAULT_WORKFLOW });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow_id, id]);

  const handleNameChange = event => {
    setModified(true);
    setWorkflow({ ...workflow, name: event.target.value });
  };

  const handleQueryChange = event => {
    setModified(true);
    setWorkflow({ ...workflow, query: event.target.value });
  };

  const handleLabelsChange = labels => {
    setModified(true);
    setWorkflow({ ...workflow, labels });
  };

  const handlePriorityChange = event => {
    setModified(true);
    setWorkflow({ ...workflow, priority: event.target.value });
  };

  const handleStatusChange = event => {
    setModified(true);
    setWorkflow({ ...workflow, status: event.target.value });
  };

  const setClassification = classification => {
    setModified(true);
    setWorkflow({ ...workflow, classification });
  };

  const removeWorkflow = () => {
    apiCall({
      url: `/api/v4/workflow/${workflow_id || id}/`,
      method: 'DELETE',
      onSuccess: () => {
        setDeleteDialog(false);
        showSuccessMessage(t('delete.success'));
        if (id) setTimeout(() => history.push('/manage/workflows'), 1000);
        close();
      }
    });
  };

  const saveWorkflow = () => {
    apiCall({
      url: workflow_id || id ? `/api/v4/workflow/${workflow_id || id}/` : '/api/v4/workflow/',
      method: workflow_id || id ? 'POST' : 'PUT',
      body: {
        ...workflow,
        priority: workflow.priority === '' ? null : workflow.priority,
        status: workflow.status === '' ? null : workflow.status
      },
      onSuccess: () => {
        showSuccessMessage(t(workflow_id || id ? 'save.success' : 'add.success'));
        setModified(false);
        close();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  return (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={removeWorkflow}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />

      <div style={{ paddingBottom: theme.spacing(4), paddingTop: theme.spacing(2) }}>
        <Classification
          type="picker"
          size="tiny"
          c12n={workflow ? workflow.classification : null}
          setClassification={setClassification}
        />
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t(workflow_id || id ? 'title' : 'add.title')}</Typography>
              <Typography variant="caption">
                {workflow ? workflow.workflow_id : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
            {(workflow_id || id) && (
              <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
                {workflow ? (
                  <Tooltip title={t('remove')}>
                    <IconButton style={{ color: theme.palette.action.active }} onClick={() => setDeleteDialog(true)}>
                      <RemoveOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                )}
              </Grid>
            )}
          </Grid>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('name')}</Typography>
            {workflow ? (
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={handleNameChange}
                value={workflow.name}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('query')}</Typography>
            {workflow ? (
              <TextField
                fullWidth
                size="small"
                margin="dense"
                variant="outlined"
                onChange={handleQueryChange}
                value={workflow.query}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('labels')}</Typography>
            {workflow ? (
              <ChipInput
                style={{ display: 'block' }}
                margin="dense"
                defaultValue={workflow.labels}
                onChange={handleLabelsChange}
                variant="outlined"
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">{t('priority')}</Typography>
            {workflow ? (
              <Select
                id="priority"
                fullWidth
                value={workflow.priority}
                onChange={handlePriorityChange}
                variant="outlined"
                margin="dense"
              >
                <MyMenuItem value="">{t('priority.null')}</MyMenuItem>
                <MyMenuItem value="LOW">{t('priority.LOW')}</MyMenuItem>
                <MyMenuItem value="MEDIUM">{t('priority.MEDIUM')}</MyMenuItem>
                <MyMenuItem value="HIGH">{t('priority.HIGH')}</MyMenuItem>
                <MyMenuItem value="CRITICAL">{t('priority.CRITICAL')}</MyMenuItem>
              </Select>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">{t('status')}</Typography>
            {workflow ? (
              <Select
                id="priority"
                fullWidth
                value={workflow.status}
                onChange={handleStatusChange}
                variant="outlined"
                margin="dense"
              >
                <MyMenuItem value="">{t('status.null')}</MyMenuItem>
                <MyMenuItem value="MALICIOUS">{t('status.MALICIOUS')}</MyMenuItem>
                <MyMenuItem value="NON-MALICIOUS">{t('status.NON-MALICIOUS')}</MyMenuItem>
                <MyMenuItem value="ASSESS">{t('status.ASSESS')}</MyMenuItem>
              </Select>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          {!id && (
            <Grid item xs={12} style={{ paddingTop: theme.spacing(2), textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={buttonLoading || !modified || !workflow.name || !workflow.query}
                onClick={saveWorkflow}
              >
                {t(workflow_id || id ? 'save' : 'add.button')}
                {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Button>
            </Grid>
          )}
        </Grid>
      </div>

      {workflow && id && modified && workflow.name && workflow.query ? (
        <div
          style={{
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[4]
          }}
        >
          <Button variant="contained" color="primary" disabled={buttonLoading} onClick={saveWorkflow}>
            {t(workflow_id || id ? 'save' : 'add.button')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  );
};

WorkflowDetail.defaultProps = {
  workflow_id: null,
  close: () => {}
};

export default WorkflowDetail;
