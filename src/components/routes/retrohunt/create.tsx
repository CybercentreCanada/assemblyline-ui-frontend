import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
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
import React, { MutableRefObject, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { RetrohuntDetail } from './detail';

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
  retrohuntRef?: MutableRefObject<RetrohuntResult>;
  onSetGlobalDrawer?: (prop: any) => void;
};

function WrappedRetrohuntCreate({ isDrawer = false, retrohuntRef = null, onSetGlobalDrawer = null }: Props) {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const DEFAULT_RETROHUNT = useMemo<RetrohuntResult>(
    () => ({
      archive_only: false,
      classification: c12nDef?.UNRESTRICTED,
      description: '',
      yara_signature: ''
    }),
    [c12nDef?.UNRESTRICTED]
  );

  const [isModified, setIsModified] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [retrohunt, setRetrohunt] = useState<RetrohuntResult>({
    ...DEFAULT_RETROHUNT,
    ...retrohuntRef.current
  });

  const onRetrohuntChange = useCallback(
    (newRetrohunt: Partial<RetrohuntResult>) => {
      setRetrohunt(rh => ({ ...rh, ...newRetrohunt }));
      retrohuntRef.current = { ...retrohuntRef.current, ...newRetrohunt };
      setIsModified(true);
    },
    [retrohuntRef]
  );

  const onCancelRetrohuntConfirmation = useCallback(() => {
    setIsConfirmationOpen(false);
  }, []);

  const onCreateRetrohunt = useCallback(
    (rh: RetrohuntResult) => {
      if (!currentUser.roles.includes('retrohunt_run')) return;
      apiCall({
        url: `/api/v4/retrohunt/`,
        method: 'POST',
        body: {
          classification: rh.classification,
          description: rh.description,
          archive_only: rh.archive_only ? rh.archive_only : false,
          yara_signature: rh.yara_signature
        },
        onSuccess: api_data => {
          const newCode: string = api_data.api_response?.code ? api_data.api_response?.code : 'new';
          showSuccessMessage(t('add.success'));
          retrohuntRef.current = { ...DEFAULT_RETROHUNT };
          setIsModified(false);
          setIsConfirmationOpen(false);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('reloadRetrohunts'));
            onSetGlobalDrawer(<RetrohuntDetail code={newCode} isDrawer />);
            navigate(`${location.pathname}${location.search ? location.search : ''}#${newCode}`);
          }, 10);
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
    [
      DEFAULT_RETROHUNT,
      currentUser.roles,
      location.pathname,
      location.search,
      navigate,
      onSetGlobalDrawer,
      retrohuntRef,
      showErrorMessage,
      showSuccessMessage,
      t
    ]
  );

  if (currentUser.roles.includes('retrohunt_run'))
    return (
      <PageFullSize margin={isDrawer ? 2 : 4}>
        <RouterPrompt when={isModified} />
        <ConfirmationDialog
          open={isConfirmationOpen}
          handleClose={_event => setIsConfirmationOpen(false)}
          handleCancel={onCancelRetrohuntConfirmation}
          handleAccept={() => onCreateRetrohunt(retrohunt)}
          title={t('validate.title')}
          cancelText={t('validate.cancelText')}
          acceptText={t('validate.acceptText')}
          text={t('validate.text')}
        />

        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} spacing={2}>
          {c12nDef.enforce && (
            <Grid item paddingBottom={theme.spacing(2)}>
              <Classification
                format="long"
                type="picker"
                c12n={retrohunt.classification}
                setClassification={(c12n: string) => onRetrohuntChange({ classification: c12n })}
                disabled={!currentUser.roles.includes('retrohunt_run')}
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
              onChange={event => onRetrohuntChange({ description: event.target.value })}
            />
          </Grid>

          <Grid item>
            <Typography variant="subtitle2">{t('details.search')}</Typography>
            <RadioGroup
              row
              value={retrohunt.archive_only ? 'archive_only' : 'all'}
              onChange={(_, value) => onRetrohuntChange({ archive_only: value === 'archive_only' })}
            >
              <FormControlLabel value="all" control={<Radio />} label={t('details.all')} />
              <FormControlLabel value="archive_only" control={<Radio />} label={t('details.archive_only')} />
            </RadioGroup>
          </Grid>

          <Grid item flex={1}>
            <Grid container flexDirection="column" height="100%" minHeight="500px">
              <Typography variant="h6" children={t('details.yara_signature')} />
              <MonacoEditor
                language="yara"
                value={retrohunt.yara_signature}
                onChange={data => onRetrohuntChange({ yara_signature: data })}
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
