import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import {
  Autocomplete,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import 'moment/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

const DEFAULT_LABELS = [
  'PHISHING',
  'CRIME',
  'ATTRIBUTED',
  'WHITELISTED',
  'FALSE_POSITIVE',
  'REPORTED',
  'MITIGATED',
  'PENDING'
];

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
      minHeight: theme.spacing(4)
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
  const { t, i18n } = useTranslation(['manageWorkflowDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [workflow, setWorkflow] = useState<Workflow>(null);
  const [modified, setModified] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const navigate = useNavigate();

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
    if ((workflow_id || id) && currentUser.roles.includes('workflow_view')) {
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
    setWorkflow({ ...workflow, labels: labels.map(label => label.toUpperCase()) });
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
        if (id) {
          setTimeout(() => navigate('/manage/workflows'), 1000);
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
        close();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
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
        setTimeout(() => window.dispatchEvent(new CustomEvent('reloadWorkflows')), 1000);
        if (!(workflow_id || id)) close();
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  };

  return currentUser.roles.includes('workflow_view') ? (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={removeWorkflow}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={buttonLoading}
      />

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification
            type="picker"
            c12n={workflow ? workflow.classification : null}
            setClassification={setClassification}
            disabled={!currentUser.roles.includes('workflow_manage')}
          />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t(workflow_id || id ? 'title' : 'add.title')}</Typography>
              <Typography variant="caption">
                {workflow ? workflow.workflow_id : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
            {(workflow_id || id) && currentUser.roles.includes('workflow_manage') && (
              <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
                {workflow ? (
                  <Tooltip title={t('remove')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                      onClick={() => setDeleteDialog(true)}
                      size="large"
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
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
                disabled={!currentUser.roles.includes('workflow_manage')}
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
                disabled={!currentUser.roles.includes('workflow_manage')}
              />
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('labels')}</Typography>
            {workflow ? (
              <Autocomplete
                fullWidth
                multiple
                freeSolo
                options={DEFAULT_LABELS}
                value={workflow.labels}
                renderInput={params => <TextField {...params} variant="outlined" />}
                onChange={(event, value) => handleLabelsChange(value as string[])}
                disabled={!currentUser.roles.includes('workflow_manage')}
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
                disabled={!currentUser.roles.includes('workflow_manage')}
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
                disabled={!currentUser.roles.includes('workflow_manage')}
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
        <div style={{ textAlign: 'center', paddingTop: theme.spacing(3) }}>
          {workflow ? (
            workflow.creator && (
              <Typography variant="subtitle2" color="textSecondary">
                {`${t('created_by')} ${workflow.creator} `}
                <Moment fromNow locale={i18n.language}>
                  {workflow.creation_date}
                </Moment>
              </Typography>
            )
          ) : (
            <Skeleton />
          )}
          {workflow ? (
            workflow.edited_by && (
              <Typography variant="subtitle2" color="textSecondary">
                {`${t('edited_by')} ${workflow.edited_by} `}
                <Moment fromNow locale={i18n.language}>
                  {workflow.last_edit}
                </Moment>
              </Typography>
            )
          ) : (
            <Skeleton />
          )}{' '}
        </div>
      </div>

      <RouterPrompt when={modified} />

      {workflow && modified && workflow.name && workflow.query ? (
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
          <Button variant="contained" color="primary" disabled={buttonLoading} onClick={saveWorkflow}>
            {t(workflow_id || id ? 'save' : 'add.button')}
            {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </div>
      ) : null}
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
};

WorkflowDetail.defaultProps = {
  workflow_id: null,
  close: () => {}
};

export default WorkflowDetail;
