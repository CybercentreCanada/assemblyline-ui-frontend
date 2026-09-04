import { ClearOutlined } from '@mui/icons-material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import { Divider, Grid, MenuItem, Skeleton, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { invalidateAppQuery, updateAppQuery, useAppMutation, useAppQuery } from 'core/api';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams } from 'core/routes';
import { AppPageCenter } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { Badlist } from 'models/base/badlist';
import { ATTRIBUTION_TYPES, DEFAULT_TEMP_ATTRIBUTION } from 'models/base/badlist';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bytesToSize, safeFieldValue } from 'shared/utils/utils';
import { IconButton } from 'ui/buttons/IconButton';
import Classification from 'ui/Classification';
import ConfirmationDialog from 'ui/ConfirmationDialog';
import CustomChip from 'ui/CustomChip';
import DatePicker from 'ui/DatePicker';
import Histogram from 'ui/Histogram';
import InputDialog from 'ui/InputDialog';
import { PageHeader } from 'ui/layouts/PageHeader';
import Moment from 'ui/Moment';

export const ManageBadlistDetailPage = memo(() => {
  const { t } = useTranslation(['manageBadlistDetail']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/badlist/detail/:id'>();
  const badlistID = useAppPathParams<'/manage/badlist/detail/:id'>()?.id;
  const { showSuccessMessage } = useMySnackbar();
  const { user: currentUser, c12nDef } = useALContext();

  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [enableDialog, setEnableDialog] = useState<boolean>(false);
  const [addAttributionDialog, setAddAttributionDialog] = useState<boolean>(false);
  const [disableDialog, setDisableDialog] = useState<boolean>(false);
  const [removeAttributionDialog, setRemoveAttributionDialog] = useState<{ type: string; value: string }>(null);
  const [removeSourceData, setRemoveSourceData] = useState<{ name: string; type: string }>(null);
  const [addAttributionData, setAddAttributionData] = useState<{ type: string; value: string }>({
    ...DEFAULT_TEMP_ATTRIBUTION
  });

  const { data: badlist } = useAppQuery({
    url: `/api/v4/badlist/${badlistID}/`,
    disabled: !badlistID || !currentUser.roles.includes('badlist_view'),
    body: null
  });

  const { data: histogram } = useAppQuery({
    url: '/api/v4/search/histogram/result/created/',
    method: 'POST',
    disabled: !badlist || !currentUser.roles.includes('badlist_view'),
    body: !badlist
      ? null
      : {
          query:
            badlist.type === 'file'
              ? `result.sections.heuristic.signature.name:"BADLIST_${badlistID}"`
              : `result.sections.tags.${badlist.tag.type}:${safeFieldValue(badlist.tag.value)}`,
          mincount: 0,
          start: 'now-30d/d',
          end: 'now+1d/d-1s',
          gap: '+1d'
        }
  });

  const handleRemoveBadlist = useAppMutation(() => ({
    url: `/api/v4/badlist/${badlistID}/`,
    method: 'DELETE',
    onSuccess: () => {
      setDeleteDialog(false);
      showSuccessMessage(t('delete.success'));
      invalidateAppQuery({ url: '/api/v4/search/badlist/' }, 1000);
      navigate.here().closePanel({ route: '/manage/badlists' });
      close();
    }
  }));

  const handleEnableHash = useAppMutation((enabled: boolean) => ({
    url: `/api/v4/badlist/enable/${badlistID}/`,
    method: 'PUT',
    body: enabled,
    onSuccess: () => {
      setEnableDialog(false);
      setDisableDialog(false);
      showSuccessMessage(enabled ? t('enable.success') : t('disable.success'));
      invalidateAppQuery({ url: '/api/v4/search/badlist/' }, 1000);
      updateAppQuery({ url: `/api/v4/badlist/${badlistID}/` }, prev => ({ ...prev, enabled }));
    }
  }));

  const handleExpiryDateChange = useAppMutation((expiry_ts: string) => ({
    url: `/api/v4/badlist/expiry/${badlistID}/`,
    method: 'DELETE',
    ...(expiry_ts && { method: 'PUT', body: expiry_ts }),
    onSuccess: () => {
      setDisableDialog(false);
      showSuccessMessage(t(expiry_ts ? 'expiry.update.success' : 'expiry.clear.success'));
      invalidateAppQuery({ url: '/api/v4/search/badlist/' }, 1000);
      updateAppQuery({ url: `/api/v4/badlist/${badlistID}/` }, prev => ({ ...prev, expiry_ts }));
    }
  }));

  const handleClassificationChange = useAppMutation((classification: string, source: string, type: string) => ({
    url: `/api/v4/badlist/classification/${badlistID}/${source}/${type}/`,
    method: 'PUT',
    body: classification,
    onSuccess: () => {
      showSuccessMessage(t('classification.update.success'));
      invalidateAppQuery({ url: '/api/v4/search/badlist/' }, 1000);
      invalidateAppQuery({ url: `/api/v4/badlist/${badlistID}/` }, 1000);
    }
  }));

  const handleDeleteSource = useAppMutation((name: string, type: string) => ({
    url: `/api/v4/badlist/source/${badlistID}/${name}/${type}/`,
    method: 'DELETE',
    onSuccess: () => {
      showSuccessMessage(t('remove.source.success'));
      invalidateAppQuery({ url: '/api/v4/search/badlist/' }, 1000);
      invalidateAppQuery({ url: `/api/v4/badlist/${badlistID}/` }, 1000);
      setRemoveSourceData(null);
    }
  }));

  const handleDeleteAttribution = useAppMutation((type: string, value: string) => ({
    url: `/api/v4/badlist/attribution/${badlistID}/${type}/${value}/`,
    method: 'DELETE',
    onSuccess: () => {
      showSuccessMessage(t('remove.attribution.success'));
      invalidateAppQuery({ url: '/api/v4/search/badlist/' }, 1000);
      invalidateAppQuery({ url: `/api/v4/badlist/${badlistID}/` }, 1000);
      setRemoveAttributionDialog(null);
    }
  }));

  const handleAddAttribution = useAppMutation((type: string, value: string) => ({
    url: `/api/v4/badlist/attribution/${badlistID}/${type}/${value}/`,
    method: 'PUT',
    onSuccess: () => {
      setAddAttributionDialog(false);
      showSuccessMessage(t('add.attribution.success'));
      invalidateAppQuery({ url: '/api/v4/search/badlist/' }, 1000);
      invalidateAppQuery({ url: `/api/v4/badlist/${badlistID}/` }, 1000);
      setTimeout(() => setAddAttributionData({ ...DEFAULT_TEMP_ATTRIBUTION }), 1000);
    }
  }));

  return (
    <AppPageCenter>
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={() => handleRemoveBadlist.mutate()}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
        waiting={handleRemoveBadlist.isPending}
      />
      <ConfirmationDialog
        open={enableDialog}
        handleClose={() => setEnableDialog(false)}
        handleAccept={() => handleEnableHash.mutate(true)}
        title={t('enable.title')}
        cancelText={t('enable.cancelText')}
        acceptText={t('enable.acceptText')}
        text={t('enable.text')}
        waiting={handleEnableHash.isPending}
      />
      <ConfirmationDialog
        open={disableDialog}
        handleClose={() => setDisableDialog(false)}
        handleAccept={() => handleEnableHash.mutate(false)}
        title={t('disable.title')}
        cancelText={t('disable.cancelText')}
        acceptText={t('disable.acceptText')}
        text={t('disable.text')}
        waiting={handleEnableHash.isPending}
      />
      <ConfirmationDialog
        open={removeAttributionDialog !== null}
        handleClose={() => setRemoveAttributionDialog(null)}
        handleAccept={() => handleDeleteAttribution.mutate(removeAttributionDialog.type, removeAttributionDialog.value)}
        title={t('remove.attribution.title')}
        cancelText={t('remove.attribution.cancelText')}
        acceptText={t('remove.attribution.acceptText')}
        text={t('remove.attribution.text')}
        waiting={handleDeleteAttribution.isPending}
      />
      <ConfirmationDialog
        open={removeSourceData !== null}
        handleClose={() => setRemoveSourceData(null)}
        handleAccept={() => handleDeleteSource.mutate(removeSourceData.name, removeSourceData.type)}
        title={t('remove.source.title')}
        cancelText={t('remove.source.cancelText')}
        acceptText={t('remove.source.acceptText')}
        text={t('remove.source.text')}
        waiting={handleDeleteSource.isPending}
      />
      <InputDialog
        open={addAttributionDialog}
        handleClose={() => setAddAttributionDialog(false)}
        handleAccept={() => handleAddAttribution.mutate(addAttributionData.type, addAttributionData.value)}
        title={t('add.attribution.title')}
        cancelText={t('add.attribution.cancelText')}
        acceptText={t('add.attribution.acceptText')}
        text={t('add.attribution.text')}
        waiting={handleAddAttribution.isPending}
        handleInputChange={event => setAddAttributionData({ ...addAttributionData, value: event.target.value })}
        inputValue={addAttributionData.value}
        inputLabel={t('add.attribution.inputlabel')}
        outLabel
        extra={
          <>
            <Typography variant="overline">{t('add.attribution.categorylabel')}</Typography>
            <TextField
              size="small"
              value={addAttributionData.type}
              variant="outlined"
              onChange={event => setAddAttributionData({ ...addAttributionData, type: event.target.value })}
              fullWidth
              select
            >
              {ATTRIBUTION_TYPES.map((item, i) => (
                <MenuItem key={i} value={item}>
                  {t(`attribution.${item}`)}
                </MenuItem>
              ))}
            </TextField>
          </>
        }
      />

      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification type="outlined" c12n={badlist ? badlist.classification : null} format="long" />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <PageHeader
          primary={badlist ? t(`title.${badlist.type}`) : t('title')}
          secondary={badlistID}
          secondaryLoading={!badlist}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(4) } }
          }}
          actions={
            <>
              <IconButton
                tooltip={t('usage')}
                loading={!badlist}
                preventRender={!badlistID || !currentUser.roles.includes('submission_view')}
                size="large"
                sx={{ color: theme.palette.action.active }}
                nav={nav =>
                  nav.to().create(
                    badlist.type === 'file'
                      ? {
                          route: '/search',
                          search: {
                            query: `sha256:${badlist.hashes.sha256 || badlistID} OR results:${badlist.hashes.sha256 || badlistID}* OR errors:${badlist.hashes.sha256 || badlistID}* OR file.sha256:${badlist.hashes.sha256 || badlistID}`
                          }
                        }
                      : {
                          route: '/search/:index',
                          path: { index: 'result' },
                          search: {
                            query: `result.sections.tags.${badlist.tag.type}:${safeFieldValue(badlist.tag.value)}`
                          }
                        }
                  )
                }
              >
                <YoutubeSearchedForIcon />
              </IconButton>
              <IconButton
                tooltip={!badlist ? null : badlist.enabled ? t('enabled') : t('disabled')}
                loading={!badlist}
                size="large"
                preventRender={!badlistID || !currentUser.roles.includes('badlist_manage')}
                onClick={!badlist ? null : badlist.enabled ? () => setDisableDialog(true) : () => setEnableDialog(true)}
              >
                {!badlist ? null : badlist.enabled ? <ToggleOnIcon /> : <ToggleOffOutlinedIcon />}
              </IconButton>
              <IconButton
                tooltip={t('remove')}
                loading={!badlist}
                size="large"
                preventRender={!badlistID || !currentUser.roles.includes('badlist_manage')}
                sx={{ color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark }}
                onClick={() => setDeleteDialog(true)}
              >
                <RemoveCircleOutlineOutlinedIcon />
              </IconButton>
            </>
          }
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} style={{ display: badlist && badlist.type === 'file' ? 'initial' : 'none' }}>
            <Typography variant="h6">{t('hashes')}</Typography>
            <Divider />
            <Grid container size="grow">
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>MD5</span>
              </Grid>
              <Grid
                size={{ xs: 8, sm: 9 }}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {badlist ? (
                  badlist.hashes.md5 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>SHA1</span>
              </Grid>
              <Grid
                size={{ xs: 8, sm: 9 }}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {badlist ? (
                  badlist.hashes.sha1 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>SHA256</span>
              </Grid>
              <Grid
                size={{ xs: 8, sm: 9 }}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {badlist ? (
                  badlist.hashes.sha256 || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>SSDeep</span>
              </Grid>
              <Grid
                size={{ xs: 8, sm: 9 }}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {badlist ? (
                  badlist.hashes.ssdeep || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>TLSH</span>
              </Grid>
              <Grid
                size={{ xs: 8, sm: 9 }}
                style={{ fontSize: '110%', fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {badlist ? (
                  badlist.hashes.tlsh || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          {badlist && badlist.file && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">{t('file.title')}</Typography>
              <Divider />
              <Grid container size="grow">
                <Grid size={{ xs: 4, sm: 3 }}>
                  <span style={{ fontWeight: 500 }}>{t('file.name')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9 }}>
                  {badlist ? badlist.file.name.map((name, i) => <div key={i}>{name}</div>) : <Skeleton />}
                </Grid>
                <Grid size={{ xs: 4, sm: 3 }}>
                  <span style={{ fontWeight: 500 }}>{t('file.size')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9 }}>
                  {badlist.file.size ? (
                    <span>
                      {badlist.file.size}
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(badlist.file.size)})</span>
                    </span>
                  ) : (
                    <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>
                  )}
                </Grid>

                <Grid size={{ xs: 4, sm: 3 }}>
                  <span style={{ fontWeight: 500 }}>{t('file.type')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9 }} style={{ wordBreak: 'break-word' }}>
                  {badlist.file.type || <span style={{ color: theme.palette.text.disabled }}>{t('unknown')}</span>}
                </Grid>
              </Grid>
            </Grid>
          )}
          {badlist && badlist.tag && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">{t('tag.title')}</Typography>
              <Divider />
              <Grid container size="grow">
                <Grid size={{ xs: 4, sm: 3 }}>
                  <span style={{ fontWeight: 500 }}>{t('tag.type')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9 }}>{badlist.tag.type}</Grid>
                <Grid size={{ xs: 4, sm: 3 }}>
                  <span style={{ fontWeight: 500 }}>{t('tag.value')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9 }} style={{ wordBreak: 'break-word' }}>
                  {badlist.tag.value}
                </Grid>
              </Grid>
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="end">
              <Grid size="grow">
                <Typography variant="h6">{t('attribution.title')}</Typography>
              </Grid>
              <Grid size="auto">
                {currentUser.roles.includes('badlist_manage') &&
                  (badlist ? (
                    <Tooltip title={t('add.attribution')}>
                      <IconButton
                        style={{
                          color:
                            theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                        }}
                        onClick={() => setAddAttributionDialog(true)}
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Skeleton
                      variant="circular"
                      height="2.5rem"
                      width="2.5rem"
                      style={{ margin: theme.spacing(0.5) }}
                    />
                  ))}
              </Grid>
            </Grid>
            <Divider />
            {badlist &&
              (!badlist.attribution ||
                Object.keys(badlist.attribution).every(
                  (k: keyof Badlist['attribution']) => !badlist.attribution[k] || badlist.attribution[k].length === 0
                )) && <span style={{ color: theme.palette.text.disabled }}>{t('attribution.empty')}</span>}
            {badlist &&
              badlist.attribution &&
              Object.keys(badlist.attribution)
                .filter(
                  (k: keyof Badlist['attribution']) => badlist.attribution[k] && badlist.attribution[k].length !== 0
                )
                .map((k: keyof Badlist['attribution'], kid) => (
                  <Grid key={kid} container spacing={2}>
                    <Grid size={{ xs: 4, sm: 3 }}>
                      <span style={{ fontWeight: 500 }}>{t(`attribution.${k}`)}</span>
                    </Grid>
                    <Grid size={{ xs: 8, sm: 9 }}>
                      {badlist.attribution[k].map((x, i) => (
                        <CustomChip
                          key={i}
                          label={x}
                          size="small"
                          variant="outlined"
                          onDelete={
                            currentUser.roles.includes('badlist_manage')
                              ? () => setRemoveAttributionDialog({ type: k, value: x })
                              : null
                          }
                        />
                      ))}
                    </Grid>
                  </Grid>
                ))}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">{t('sources')}</Typography>
            <Divider />
            {badlist ? (
              badlist.sources.map((src, src_id) => (
                <Grid key={src_id} container>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <span style={{ fontWeight: 500 }}>
                      {src.name} ({t(src.type)})
                      {(currentUser.is_admin || currentUser.username === src.name) && badlist.sources.length !== 1 && (
                        <Tooltip title={t('remove.source.tooltip')}>
                          <IconButton
                            size="small"
                            onClick={() => setRemoveSourceData({ name: src.name, type: src.type })}
                          >
                            <ClearOutlined style={{ fontSize: theme.spacing(2) }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </span>
                  </Grid>
                  <Grid size={{ xs: 12, sm: c12nDef.enforce ? 7 : 9 }}>
                    {src.reason.map((reason, i) => (
                      <div key={i}>{reason}</div>
                    ))}
                  </Grid>
                  {c12nDef.enforce && (
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Classification
                        fullWidth
                        size="small"
                        format="short"
                        c12n={src.classification}
                        type={currentUser.is_admin || currentUser.username === src.name ? 'picker' : 'outlined'}
                        setClassification={
                          currentUser.is_admin || currentUser.username === src.name
                            ? classification => handleClassificationChange.mutate(classification, src.name, src.type)
                            : null
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              ))
            ) : (
              <Skeleton />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="end">
              <Grid size="grow">
                <Typography variant="h6">{t('timing')}</Typography>
              </Grid>
              <Grid size="auto">
                {currentUser.roles.includes('badlist_manage') &&
                  (badlist ? (
                    <DatePicker
                      date={badlist.expiry_ts}
                      setDate={date => handleExpiryDateChange.mutate(date)}
                      tooltip={t('expiry.change')}
                      defaultDateOffset={1}
                      minDateTomorrow
                    />
                  ) : (
                    <Skeleton
                      variant="circular"
                      height="2.5rem"
                      width="2.5rem"
                      style={{ margin: theme.spacing(0.5) }}
                    />
                  ))}
              </Grid>
            </Grid>
            <Divider />
            <Grid container size="grow">
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>{t('timing.added')}</span>
              </Grid>
              <Grid size={{ xs: 8, sm: 9 }}>
                {badlist ? (
                  <div>
                    <Moment format="YYYY-MM-DD">{badlist.added}</Moment>&nbsp; (
                    <Moment variant="fromNow">{badlist.added}</Moment>)
                  </div>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>{t('timing.updated')}</span>
              </Grid>
              <Grid size={{ xs: 8, sm: 9 }}>
                {badlist ? (
                  <div>
                    <Moment format="YYYY-MM-DD">{badlist.updated}</Moment>&nbsp; (
                    <Moment variant="fromNow">{badlist.updated}</Moment>)
                  </div>
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 3 }}>
                <span style={{ fontWeight: 500 }}>{t('timing.expiry_ts')}</span>
              </Grid>
              <Grid size={{ xs: 8, sm: 9 }}>
                {badlist ? (
                  badlist.expiry_ts ? (
                    <div>
                      <Moment format="YYYY-MM-DD">{badlist.expiry_ts}</Moment>&nbsp; (
                      <Moment variant="fromNow">{badlist.expiry_ts}</Moment>)
                    </div>
                  ) : (
                    <span style={{ color: theme.palette.text.disabled }}>{t('expiry.forever')}</span>
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          {currentUser.roles.includes('submission_view') && (
            <Grid size={{ xs: 12 }}>
              <Histogram
                dataset={histogram}
                height="300px"
                isDate
                title={t('chart.title')}
                datatype={badlistID}
                verticalLine
              />
            </Grid>
          )}
        </Grid>
      </div>
    </AppPageCenter>
  );
});

export const ManageBadlistDetailRoute = createAppRoute({
  component: ManageBadlistDetailPage,

  path: '/manage/badlist/detail/:id',
  params: s => ({
    id: s.string()
  }),

  ancestor: '/manage/badlists',
  shortname: location => [
    'app_route.manage_badlist_detail.shortname',
    { ns: 'manageBadlistDetail', id: location.path.id }
  ],
  fullname: location => [
    'app_route.manage_badlist_detail.fullname',
    { ns: 'manageBadlistDetail', id: location.path.id }
  ],
  shorticon: () => <BugReportOutlinedIcon />,
  fullicon: () => <BugReportOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('badlist_view')
});
