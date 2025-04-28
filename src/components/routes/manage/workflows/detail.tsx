import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Workflow } from 'components/models/base/workflow';
import ForbiddenPage from 'components/routes/403';
import {
  DeleteWorkflowAction,
  DuplicateWorkflowAction,
  EditWorkflowAction,
  EnableWorkflowAction,
  RunWorkflowAction,
  ShowRelatedAlertsAction
} from 'components/routes/manage/workflows/components/Actions';
import { AlertHistogram, AlertResults } from 'components/routes/manage/workflows/components/Data';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { PageHeader as ALPageHeader } from 'components/visual/Layouts/PageHeader';
import Moment from 'components/visual/Moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

const CUSTOMCHIP_STYLES = {
  borderRadius: '4px',
  height: 'auto',
  justifyContent: 'flex-start',
  marginBottom: '4px',
  marginTop: '8px',
  minHeight: '40px',
  overflow: 'auto',
  textOverflow: 'initial',
  whiteSpace: 'wrap'
};

type Params = {
  id: string;
};

type Props = {
  id?: string;
  onClose?: () => void;
};

const WrappedWorkflowDetail = ({ id: propID = null, onClose = null }: Props) => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const { id: paramID } = useParams<Params>();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { c12nDef, user: currentUser } = useALContext();
  const { showErrorMessage } = useMySnackbar();

  const [workflow, setWorkflow] = useState<Workflow>(null);

  const id = useMemo<string>(() => propID || paramID, [paramID, propID]);

  const handleReload = useCallback(() => {
    if (!id || !currentUser.roles.includes('workflow_view')) return;

    apiCall<Workflow>({
      url: `/api/v4/workflow/${id}/`,
      onSuccess: ({ api_response }) => {
        setWorkflow({
          ...api_response,
          status: api_response.status || '',
          priority: api_response.priority || '',
          enabled: api_response.enabled === undefined ? true : api_response.enabled
        });
      },
      onFailure: api_data => {
        showErrorMessage(api_data.api_error_message);
        !onClose ? null : onClose();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, id, onClose]);

  useEffect(() => {
    handleReload();
  }, [handleReload]);

  if (!currentUser.roles.includes('workflow_view')) return <ForbiddenPage />;
  else
    return (
      <PageCenter margin={2} width="100%">
        {c12nDef.enforce && (
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Classification type="outlined" c12n={!workflow ? null : workflow.classification} />
          </div>
        )}

        <div style={{ textAlign: 'left' }}>
          <ALPageHeader
            primary={t('title')}
            secondary={id}
            loading={!workflow}
            style={{ paddingBottom: theme.spacing(2) }}
            actions={[
              <>
                <RunWorkflowAction id={id} workflow={workflow} />
                <ShowRelatedAlertsAction id={id} workflow={workflow} />
                <DuplicateWorkflowAction id={id} workflow={workflow} />
                <EditWorkflowAction id={id} workflow={workflow} />
                <EnableWorkflowAction
                  id={id}
                  workflow={workflow}
                  onChange={enabled => setWorkflow(wf => ({ ...wf, enabled: enabled }))}
                />
                <DeleteWorkflowAction id={id} workflow={workflow} />
              </>
            ]}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">{t('name')}</Typography>
              {!workflow ? (
                <Skeleton style={{ height: '2.5rem' }} />
              ) : (
                <CustomChip
                  label={<Typography variant="subtitle1">{workflow.name}</Typography>}
                  fullWidth
                  size="medium"
                  type="rounded"
                  variant="outlined"
                  style={CUSTOMCHIP_STYLES}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">{t('query')}</Typography>
              {!workflow ? (
                <Skeleton style={{ height: '2.5rem' }} />
              ) : (
                <CustomChip
                  label={<Typography variant="subtitle1">{workflow.query}</Typography>}
                  fullWidth
                  size="medium"
                  type="rounded"
                  variant="outlined"
                  style={CUSTOMCHIP_STYLES}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2">{t('labels')}</Typography>
              {!workflow ? (
                <Skeleton style={{ height: '2.5rem' }} />
              ) : (
                <CustomChip
                  label={
                    <div style={{ display: 'flex', gap: theme.spacing(1), padding: '9px 0px' }}>
                      {workflow.labels.map((label, i) => (
                        <CustomChip key={i} label={label} />
                      ))}
                    </div>
                  }
                  fullWidth
                  size="medium"
                  type="rounded"
                  variant="outlined"
                  style={CUSTOMCHIP_STYLES}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">{t('priority')}</Typography>
              {!workflow ? (
                <Skeleton style={{ height: '2.5rem' }} />
              ) : (
                <CustomChip
                  label={<Typography variant="subtitle1">{workflow.priority}</Typography>}
                  fullWidth
                  size="medium"
                  type="rounded"
                  variant="outlined"
                  style={CUSTOMCHIP_STYLES}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">{t('status')}</Typography>
              {!workflow ? (
                <Skeleton style={{ height: '2.5rem' }} />
              ) : (
                <CustomChip
                  label={<Typography variant="subtitle1">{workflow.status}</Typography>}
                  fullWidth
                  size="medium"
                  type="rounded"
                  variant="outlined"
                  style={CUSTOMCHIP_STYLES}
                />
              )}
            </Grid>
          </Grid>

          <Grid style={{ paddingTop: theme.spacing(4) }}>
            <Grid container size="grow">
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">{t('statistics')}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
                  {t('hits')}
                </Typography>
                <Grid container size="grow">
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('hit.count')}</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>{workflow ? workflow.hit_count : 0}</Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('hit.first')}</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow && workflow.first_seen ? (
                      <Moment variant="fromNow">{workflow.first_seen}</Moment>
                    ) : (
                      t('hit.none')
                    )}
                  </Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('hit.last')}</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow && workflow.last_seen ? (
                      <Moment variant="fromNow">{workflow.last_seen}</Moment>
                    ) : (
                      t('hit.none')
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
                  {t('details')}
                </Typography>
                <Grid container size="grow">
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('created_by')}:</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow && workflow.creator ? (
                      <>
                        {workflow.creator} [<Moment variant="fromNow">{workflow.creation_date}</Moment>]
                      </>
                    ) : (
                      <Skeleton />
                    )}
                  </Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('edited_by')}:</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow && workflow.edited_by ? (
                      <>
                        {workflow.edited_by} [<Moment variant="fromNow">{workflow.last_edit}</Moment>]
                      </>
                    ) : (
                      <Skeleton />
                    )}
                  </Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('origin')}:</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow && workflow ? workflow.origin : <Skeleton />}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {!currentUser.roles.includes('alert_view') ? null : (
            <>
              <Grid size={{ xs: 12 }} style={{ paddingTop: '10px' }}>
                <AlertHistogram id={id} />
              </Grid>
              <Grid size={{ xs: 12 }} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                <Typography variant="h6">{t('last10')}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }} style={{ paddingTop: '10px' }}>
                <AlertResults id={id} />
              </Grid>
            </>
          )}
        </div>
      </PageCenter>
    );
};

export const WorkflowDetail = React.memo(WrappedWorkflowDetail);
export default WorkflowDetail;
