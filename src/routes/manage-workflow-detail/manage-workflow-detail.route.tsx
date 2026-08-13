import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { useApiQuery } from 'core/api';
import { createAppRoute, useAppPathParams } from 'core/routes';
import { AppPageCenter } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { Workflow } from 'models/base/workflow';
import { PRIORITIES, STATUSES } from 'models/base/workflow';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DeleteWorkflowAction,
  DuplicateWorkflowAction,
  EditWorkflowAction,
  EnableWorkflowAction,
  RunWorkflowAction,
  ShowRelatedAlertsAction
} from 'routes/manage-workflow-detail/components/Actions';
import { AlertHistogram, AlertResults } from 'routes/manage-workflow-detail/components/Data';
import Classification from 'ui/Classification';
import { ChipsInput } from 'ui/inputs/ChipsInput';
import { SelectInput } from 'ui/inputs/SelectInput';
import { TextAreaInput } from 'ui/inputs/TextAreaInput';
import { TextInput } from 'ui/inputs/TextInput';
import { PageHeader } from 'ui/layouts/PageHeader';
import Moment from 'ui/Moment';

export const ManageWorkflowDetailPage = memo(() => {
  const { t } = useTranslation(['manageWorkflowDetail']);
  const paramID = useAppPathParams<'/manage/workflow/detail/:id'>()?.id;
  const theme = useTheme();
  const { c12nDef, user: currentUser } = useALContext();
  const { showErrorMessage } = useMySnackbar();

  const workflow = useApiQuery<Workflow>({
    url: `/api/v4/workflow/${paramID}/`,
    disabled: !paramID || !currentUser.roles.includes('workflow_view'),
    onFailure: ({ api_error_message }) => {
      showErrorMessage(api_error_message);
    }
  });

  return (
    <AppPageCenter>
      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(2) }}>
          <Classification type="outlined" c12n={workflow.isFetching ? null : workflow.data.classification} />
        </div>
      )}

      <div style={{ textAlign: 'left' }}>
        <PageHeader
          primary={t('title')}
          secondary={paramID}
          secondaryLoading={!workflow}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(2) } }
          }}
          actions={
            <>
              <RunWorkflowAction id={paramID} workflow={workflow.data} />
              <ShowRelatedAlertsAction id={paramID} workflow={workflow.data} />
              <DuplicateWorkflowAction id={paramID} workflow={workflow.data} />
              <EditWorkflowAction id={paramID} workflow={workflow.data} />
              <EnableWorkflowAction id={paramID} workflow={workflow.data} onChange={() => workflow.refetch()} />
              <DeleteWorkflowAction id={paramID} workflow={workflow.data} />
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
            <TextAreaInput
              label={t('query')}
              readOnly
              minRows={1}
              maxRows={5}
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
              <AlertHistogram id={paramID} />
            </Grid>
            <Grid size={{ xs: 12 }} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              <Typography variant="h6">{t('last10')}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }} style={{ paddingTop: '10px' }}>
              <AlertResults id={paramID} />
            </Grid>
          </>
        )}
      </div>
    </AppPageCenter>
  );
});

export const ManageWorkflowDetailRoute = createAppRoute({
  component: ManageWorkflowDetailPage,

  path: '/manage/workflow/detail/:id',
  params: s => ({
    id: s.string()
  }),

  ancestor: '/manage/workflows',
  shortname: location => ({ i18nKey: location?.path?.id ?? 'breadcrumb.workflow.detail', ns: 'app' }),
  fullname: () => ({ i18nKey: 'breadcrumb.workflow.detail', ns: 'app' }),
  shorticon: () => <ListOutlinedIcon />,
  fullicon: () => <ListOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('workflow_view')
});
