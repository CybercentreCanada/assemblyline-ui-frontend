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

export default function WorkflowDetail() {
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
    if (id) {
      apiCall({
        url: `/api/v4/workflow/${id}/`,
        onSuccess: api_data => {
          setWorkflow(api_data.api_response);
        }
      });
    } else {
      setWorkflow({ ...DEFAULT_WORKFLOW });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      url: `/api/v4/workflow/${id}/`,
      method: 'DELETE',
      onSuccess: () => {
        showSuccessMessage(t('delete.success'));
        history.push('/manage/workflows');
      }
    });
  };

  const saveWorkflow = () => {
    apiCall({
      url: id ? `/api/v4/workflow/${id}/` : '/api/v4/workflow/',
      method: id ? 'POST' : 'PUT',
      body: workflow,
      onSuccess: () => {
        showSuccessMessage(t('save.success'));
        setModified(false);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  return (
    <PageCenter margin={4}>
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
              <Typography variant="h4">{t('title')}</Typography>
              <Typography variant="caption">
                {workflow ? workflow.workflow_id : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
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
        </Grid>
      </div>

      {workflow && modified ? (
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
          <Button variant="contained" color="primary" disabled={buttonLoading || !modified} onClick={saveWorkflow}>
            {t('save')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  );
}
