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
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import { RetrohuntResult } from 'components/routes/retrohunt';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { MonacoEditor } from 'components/visual/MonacoEditor';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  circularProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

type Props = {
  isDrawer?: boolean;
  onCreateRetrohunt?: (retrohunt: RetrohuntResult) => void;
};

function WrappedRetrohuntCreate({ isDrawer = false, onCreateRetrohunt = job => null }: Props) {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { closeGlobalDrawer } = useDrawer();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const { c12nDef, configuration } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const DEFAULT_RETROHUNT = useMemo<RetrohuntResult>(
    () => ({
      indices: null,
      created_time: null,
      started_time: null,
      completed_time: null,
      key: null,
      finished: null,
      truncated: false,
      creator: '',

      archive_only: false,
      classification: c12nDef?.UNRESTRICTED,
      search_classification: currentUser.classification,
      description: '',
      ttl: !configuration.retrohunt.dtl ? 30 : configuration.retrohunt.dtl,
      yara_signature: ''
    }),
    [c12nDef?.UNRESTRICTED, configuration.retrohunt.dtl, currentUser.classification]
  );

  const [retrohunt, setRetrohunt] = useState<RetrohuntResult>({ ...DEFAULT_RETROHUNT });
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);

  const maxDaysToLive = useMemo<number>(
    () => (!configuration.retrohunt.max_dtl ? null : configuration.retrohunt.max_dtl),
    [configuration.retrohunt.max_dtl]
  );

  const handleCreateRetrohunt = useCallback(
    (result: RetrohuntResult) => {
      if (!currentUser.roles.includes('retrohunt_run') && configuration?.retrohunt?.enabled) return;
      apiCall({
        method: 'PUT',
        url: `/api/v4/retrohunt/`,
        body: {
          archive_only: result.archive_only,
          classification: result.classification,
          search_classification: result.search_classification,
          description: result.description,
          ttl: result.ttl,
          yara_signature: result.yara_signature
        },
        onSuccess: api_data => {
          showSuccessMessage(t('add.success'));
          setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response });
          setIsModified(false);
          setIsDisabled(true);
          setIsConfirmationOpen(false);
          setTimeout(() => window.dispatchEvent(new CustomEvent('reloadRetrohunts')), 1000);
        },
        onFailure: api_data => {
          showErrorMessage(api_data.api_error_message);
          setIsConfirmationOpen(false);
        },
        onEnter: () => setIsButtonLoading(true),
        onExit: () => setIsButtonLoading(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, currentUser.roles, onCreateRetrohunt, showErrorMessage, showSuccessMessage, t]
  );

  const handleRetrohuntChange = useCallback((newRetrohunt: Partial<RetrohuntResult>) => {
    setRetrohunt(rh => ({ ...rh, ...newRetrohunt }));
    setIsModified(true);
  }, []);

  useEffect(() => {
    if (retrohunt && retrohunt?.key) {
      onCreateRetrohunt(retrohunt);
    }
  }, [onCreateRetrohunt, retrohunt]);

  useEffect(() => {
    if (!location.pathname.startsWith('/retrohunt')) closeGlobalDrawer();
  }, [closeGlobalDrawer, location.pathname]);

  if (configuration?.retrohunt?.enabled && currentUser.roles.includes('retrohunt_run'))
    return (
      <PageFullSize margin={isDrawer ? 2 : 4}>
        <RouterPrompt when={isModified} />
        <ConfirmationDialog
          open={isConfirmationOpen}
          handleClose={() => setIsConfirmationOpen(false)}
          handleCancel={() => setIsConfirmationOpen(false)}
          handleAccept={() => handleCreateRetrohunt(retrohunt)}
          title={t('validate.title')}
          cancelText={t('validate.cancelText')}
          acceptText={t('validate.acceptText')}
          text={t('validate.text')}
        />

        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} rowGap={1}>
          {c12nDef.enforce && (
            <Grid item paddingBottom={theme.spacing(2)}>
              <Classification
                format="long"
                type="picker"
                c12n={retrohunt.classification}
                setClassification={(c12n: string) => handleRetrohuntChange({ classification: c12n })}
                disabled={!currentUser.roles.includes('retrohunt_run') || isDisabled}
              />
            </Grid>
          )}

          <Grid item>
            <Grid container flexDirection="row">
              <Grid item flexGrow={1}>
                <Typography variant="h4" children={t('header.add')} />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isButtonLoading || !retrohunt?.description || !retrohunt?.yara_signature}
                  onClick={() => setIsConfirmationOpen(true)}
                >
                  {t('add.button')}
                  {isButtonLoading && <CircularProgress className={classes.circularProgress} size={24} />}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
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

          <Grid item>
            <Grid container flexDirection="row" rowGap={2}>
              <Grid item flexGrow={3}>
                <Typography variant="subtitle2">{t('details.search')}</Typography>
                <RadioGroup
                  row
                  value={retrohunt.archive_only ? 'archive_only' : 'all'}
                  onChange={(_, value) => handleRetrohuntChange({ archive_only: value === 'archive_only' })}
                >
                  <FormControlLabel value="all" control={<Radio />} label={t('details.all')} disabled={isDisabled} />
                  <FormControlLabel
                    value="archive_only"
                    control={<Radio />}
                    label={t('details.archive_only')}
                    disabled={isDisabled}
                  />
                </RadioGroup>
              </Grid>
              <Grid item flexGrow={2}>
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
            <Grid item marginBottom={1}>
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

          <Grid item flex={1}>
            <Grid container flexDirection="column" height="100%" minHeight="500px">
              <Typography variant="h6" children={t('details.yara_signature')} />
              <MonacoEditor
                language="yara"
                value={retrohunt.yara_signature}
                onChange={data => handleRetrohuntChange({ yara_signature: data })}
                options={{ readOnly: isDisabled }}
              />
            </Grid>
          </Grid>
        </Grid>
      </PageFullSize>
    );
  else return <ForbiddenPage />;
}

export const RetrohuntCreate = React.memo(WrappedRetrohuntCreate);

WrappedRetrohuntCreate.defaultProps = {
  isDrawer: false,
  retrohuntRef: null
} as Props;

export default WrappedRetrohuntCreate;
