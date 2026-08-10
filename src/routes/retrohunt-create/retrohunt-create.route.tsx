import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useAppBlocker, useAppNavigate } from 'core/router';
import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { Retrohunt, RetrohuntIndex } from 'models/base/retrohunt';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Classification from 'ui/Classification';
import ConfirmationDialog from 'ui/ConfirmationDialog';
import { PageHeader } from 'ui/layouts/PageHeader';
import MonacoEditor from 'ui/MonacoEditor';
import { PageFullSizeLayout } from 'ui/pages/PageFullSize';

type RetrohuntData = Pick<
  Retrohunt,
  'classification' | 'search_classification' | 'description' | 'yara_signature' | 'indices' | 'key' | 'ttl'
>;

export const RetrohuntCreatePage = memo(() => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const navigate = useAppNavigate();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const { c12nDef, configuration } = useALContext();
  const { user: currentUser } = useALContext();

  const DEFAULT_RETROHUNT = useMemo<RetrohuntData>(
    () => ({
      classification: c12nDef?.UNRESTRICTED,
      completed_time: null,
      created_time: null,
      creator: '',
      description: '',
      finished: null,
      indices: configuration?.datastore?.archive?.enabled ? 'hot_and_archive' : 'hot',
      key: null,
      search_classification: currentUser.classification,
      started_time: null,
      truncated: false,
      ttl: !configuration?.retrohunt?.dtl ? 30 : configuration?.retrohunt?.dtl,
      yara_signature: `rule yara_template {
  meta:
    description = ""
  strings:
    $a = "First string"
    $b = /some_regex_with_a_string/
  condition:
    all of them
}
      `
    }),
    [
      c12nDef?.UNRESTRICTED,
      configuration?.datastore?.archive?.enabled,
      configuration?.retrohunt?.dtl,
      currentUser.classification
    ]
  );

  const [retrohunt, setRetrohunt] = useState<RetrohuntData>({ ...DEFAULT_RETROHUNT });
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);

  useAppBlocker(() => (isModified ? 'unsaved_changes' : null), [isModified]);

  const maxDaysToLive = useMemo<number>(
    () => (!configuration.retrohunt.max_dtl ? null : configuration.retrohunt.max_dtl),
    [configuration.retrohunt.max_dtl]
  );

  const handleCreateRetrohunt = useCallback(
    (result: RetrohuntData) => {
      setIsConfirmationOpen(false);
      if (!currentUser.roles.includes('retrohunt_run') && configuration?.retrohunt?.enabled) return;
      apiCall({
        method: 'PUT',
        url: `/api/v4/retrohunt/`,
        body: {
          classification: result.classification,
          description: result.description,
          indices: result.indices,
          search_classification: result.search_classification,
          ttl: result.ttl,
          yara_signature: result.yara_signature
        },
        onSuccess: api_data => {
          showSuccessMessage(t('add.success'));
          setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response });
          setIsModified(false);
          setIsDisabled(true);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('reloadRetrohunts'));
            if (api_data.api_response?.key) {
              navigate.here().create({ route: '/retrohunt/detail/:id', path: { id: api_data.api_response?.key } });
            }
          }, 1000);
        },
        onFailure: api_data => {
          showErrorMessage(api_data.api_error_message);
        },
        onEnter: () => setIsButtonLoading(true),
        onExit: () => setIsButtonLoading(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, currentUser.roles, showErrorMessage, showSuccessMessage, t]
  );

  const handleRetrohuntChange = useCallback((newRetrohunt: Partial<RetrohuntData>) => {
    setRetrohunt(rh => ({ ...rh, ...newRetrohunt }));
    setIsModified(true);
  }, []);

  return (
    <PageFullSizeLayout margin={2}>
      <ConfirmationDialog
        open={isConfirmationOpen}
        handleClose={() => setIsConfirmationOpen(false)}
        handleCancel={() => setIsConfirmationOpen(false)}
        handleAccept={() => handleCreateRetrohunt(retrohunt)}
        title={t('validate.title')}
        cancelText={t('validate.cancelText')}
        acceptText={t('validate.acceptText')}
        text={t('validate.text')}
        waiting={isButtonLoading}
      />

      <Grid container flexDirection="column" flexWrap="nowrap" flex={1} rowGap={1}>
        {c12nDef.enforce && (
          <Grid paddingBottom={theme.spacing(2)}>
            <Classification
              format="long"
              type="picker"
              c12n={retrohunt.classification}
              setClassification={(c12n: string) => handleRetrohuntChange({ classification: c12n })}
              disabled={!currentUser.roles.includes('retrohunt_run') || isDisabled}
            />
          </Grid>
        )}

        <PageHeader
          primary={t('header.add')}
          actions={
            <Button
              variant="contained"
              color="primary"
              disabled={isButtonLoading || !retrohunt?.description || !retrohunt?.yara_signature}
              onClick={() => setIsConfirmationOpen(true)}
            >
              {t('add.button')}
              {isButtonLoading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
            </Button>
          }
        />

        <Grid>
          <Typography variant="subtitle2">{t('details.description')}</Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            margin="dense"
            variant="outlined"
            value={retrohunt.description}
            onChange={event => handleRetrohuntChange({ description: event.target.value })}
            disabled={isDisabled}
          />
        </Grid>

        <Grid>
          <Grid container flexDirection="row" rowGap={2}>
            {configuration?.datastore?.archive?.enabled && (
              <Grid flexGrow={3}>
                <Typography variant="subtitle2">{t('details.search')}</Typography>
                <RadioGroup
                  row
                  value={retrohunt.indices}
                  onChange={(_, value: RetrohuntIndex) => handleRetrohuntChange({ indices: value })}
                >
                  <FormControlLabel value="hot" control={<Radio />} label={t('details.hot')} disabled={isDisabled} />
                  <FormControlLabel
                    value="archive"
                    control={<Radio />}
                    label={t('details.archive')}
                    disabled={isDisabled}
                  />
                  <FormControlLabel
                    value="hot_and_archive"
                    control={<Radio />}
                    label={t('details.hot_and_archive')}
                    disabled={isDisabled}
                  />
                </RadioGroup>
              </Grid>
            )}
            <Grid flexGrow={2}>
              <Typography variant="subtitle2">
                {`${t('ttl')} (${maxDaysToLive ? `${t('ttl.max')}: ${maxDaysToLive}` : t('ttl.forever')})`}
              </Typography>
              <TextField
                id="ttl"
                type="number"
                margin="dense"
                size="small"
                inputProps={{
                  min: maxDaysToLive ? 1 : 0,
                  max: maxDaysToLive ? maxDaysToLive : 365
                }}
                defaultValue={retrohunt.ttl}
                onChange={event => handleRetrohuntChange({ ttl: parseInt(event.target.value) })}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>

        {c12nDef.enforce && (
          <Grid marginBottom={1}>
            <Tooltip title={t('tooltip.search_classification')} placement="top">
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing(1),
                  marginBottom: theme.spacing(0.5)
                }}
              >
                <Typography variant="subtitle2">{t('details.search_classification')}</Typography>
                <InfoOutlinedIcon />
              </div>
            </Tooltip>
            <Classification
              format="long"
              type="picker"
              c12n={retrohunt.search_classification}
              setClassification={(c12n: string) => handleRetrohuntChange({ search_classification: c12n })}
              disabled={!currentUser.roles.includes('retrohunt_run') || isDisabled}
            />
          </Grid>
        )}

        <Grid flex={1}>
          <Grid container flexDirection="column" height="100%" minHeight="500px">
            <Typography variant="h6" children={t('details.yara_rule')} />
            <MonacoEditor
              language="yara"
              value={retrohunt.yara_signature}
              onChange={data => handleRetrohuntChange({ yara_signature: data })}
              options={{ readOnly: isDisabled }}
            />
          </Grid>
        </Grid>
      </Grid>
    </PageFullSizeLayout>
  );
});

export const RetrohuntCreateRoute = createAppRoute({
  component: RetrohuntCreatePage,

  path: '/retrohunt/create',

  ancestor: '/retrohunt',
  shortname: () => ({ i18nKey: 'drawer.retrohunt', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.retrohunt', ns: 'app' }),
  shorticon: () => <DataObjectOutlinedIcon />,
  fullicon: () => <DataObjectOutlinedIcon />,

  disabled: (_location, config) => !config.configuration?.retrohunt?.enabled,
  forbidden: (_location, config) => !config.user.roles.includes('retrohunt_run')
});
