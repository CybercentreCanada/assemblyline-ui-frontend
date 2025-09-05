import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import { useAPIQuery } from 'components/core/Query/API/useAPIQuery';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { PRIORITIES, STATUSES, type Workflow } from 'components/models/base/workflow';
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
import { ChipsInput } from 'components/visual/Inputs/ChipsInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import Moment from 'components/visual/Moment';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

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
  const { c12nDef, user: currentUser } = useALContext();
  const { showErrorMessage } = useMySnackbar();

  const id = useMemo<string>(() => propID || paramID, [paramID, propID]);

  const workflow = useAPIQuery<Workflow>({
    url: `/api/v4/workflow/${id}/`,
    disabled: !id || !currentUser.roles.includes('workflow_view'),
    onFailure: ({ api_error_message }) => {
      showErrorMessage(api_error_message);
      !onClose ? null : onClose();
    }
  });

  if (!currentUser.roles.includes('workflow_view')) return <ForbiddenPage />;
  else
    return (
      <PageCenter margin={2} width="100%">
        {c12nDef.enforce && (
          <div style={{ paddingBottom: theme.spacing(2) }}>
            <Classification type="outlined" c12n={workflow.isFetching ? null : workflow.data.classification} />
          </div>
        )}

        <div style={{ textAlign: 'left' }}>
          <PageHeader
            primary={t('title')}
            secondary={id}
            secondaryLoading={!workflow}
            slotProps={{
              root: { style: { marginBottom: theme.spacing(2) } }
            }}
            actions={
              <>
                <RunWorkflowAction id={id} workflow={workflow.data} />
                <ShowRelatedAlertsAction id={id} workflow={workflow.data} />
                <DuplicateWorkflowAction id={id} workflow={workflow.data} />
                <EditWorkflowAction id={id} workflow={workflow.data} />
                <EnableWorkflowAction id={id} workflow={workflow.data} onChange={() => workflow.refetch()} />
                <DeleteWorkflowAction id={id} workflow={workflow.data} />
              </>
            }
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextInput
                label={t('name')}
                readOnly
                loading={workflow.isFetching}
                value={workflow.isFetching ? null : workflow.data.name}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextInput
                label={t('query')}
                readOnly
                loading={workflow.isFetching}
                value={workflow.isFetching ? null : workflow.data.query}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ChipsInput
                label={t('labels')}
                readOnly
                loading={workflow.isFetching}
                value={workflow.isFetching ? null : workflow.data.labels}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectInput
                label={t('priority')}
                readOnly
                loading={workflow.isFetching}
                value={workflow.isFetching ? null : workflow.data.priority}
                options={PRIORITIES.map(v => ({ primary: v, value: v }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectInput
                label={t('status')}
                readOnly
                loading={workflow.isFetching}
                value={workflow.isFetching ? null : workflow.data.status}
                options={STATUSES.map(v => ({ primary: v, value: v }))}
              />
            </Grid>
          </Grid>

          <Grid style={{ paddingTop: theme.spacing(4) }}>
            <Grid container size="grow" columnSpacing={2}>
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
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow.isFetching ? <Skeleton /> : workflow.data?.hit_count ? workflow.data.hit_count : 0}
                  </Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('hit.first')}</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow.isFetching ? (
                      <Skeleton />
                    ) : workflow.data?.first_seen ? (
                      <Moment variant="fromNow">{workflow.data.first_seen}</Moment>
                    ) : (
                      t('hit.none')
                    )}
                  </Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('hit.last')}</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow.isFetching ? (
                      <Skeleton />
                    ) : workflow.data?.last_seen ? (
                      <Moment variant="fromNow">{workflow.data.last_seen}</Moment>
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
                    {workflow.isFetching ? (
                      <Skeleton />
                    ) : !workflow.data?.creator ? null : (
                      <>
                        {workflow.data.creator} [<Moment variant="fromNow">{workflow.data.creation_date}</Moment>]
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('edited_by')}:</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow.isFetching ? (
                      <Skeleton />
                    ) : !workflow.data?.edited_by ? null : (
                      <>
                        {workflow.data.edited_by} [<Moment variant="fromNow">{workflow.data.last_edit}</Moment>]
                      </>
                    )}
                  </Grid>
                  <Grid size={{ xs: 3, sm: 4, md: 3, lg: 3 }}>
                    <span style={{ fontWeight: 500 }}>{t('origin')}:</span>
                  </Grid>
                  <Grid size={{ xs: 9, sm: 8, md: 9, lg: 9 }}>
                    {workflow.isFetching ? <Skeleton /> : workflow.data.origin}
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
