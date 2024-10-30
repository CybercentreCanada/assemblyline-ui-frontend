import Flow from '@flowjs/flow.js';
import { Alert, Grid, useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Metadata } from 'components/models/base/submission';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { TabContainer } from 'components/visual/TabContainer';
import generateUUID from 'helpers/uuid';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { MetadataParameters } from './components/MetadataParameters';
import { ServiceSelection } from './components/ServiceSelection';
import { SubmissionParameters } from './components/SubmissionParameters';
import { FormProvider, useForm } from './contexts/form';
import { FileSubmit } from './tabs/file';
import { HashSubmit } from './tabs/hash';

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  meta_key: {
    overFLOWX: 'hidden',
    whiteSpace: 'nowrap',
    textOverFLOW: 'ellipsis'
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tweaked_tabs: {
    [theme.breakpoints.only('xs')]: {
      '& [role=tab]': {
        minWidth: '90px'
      }
    }
  }
}));

// eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const FLOW = new Flow({
  target: '/api/v4/ui/FLOWjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

const TABS = ['file', 'hash', 'options'] as const;
type Tabs = (typeof TABS)[number];

type SubmitState = {
  hash: string;
  tabContext: string;
  c12n: string;
  metadata?: Metadata;
};

type SubmitProps = {
  none: boolean;
};

const WrappedSubmitContent = () => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const banner = useAppBanner();
  const { user: currentUser, c12nDef, configuration } = useALContext();
  const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();

  const form = useForm();

  const [tab, setTab] = useState<Tabs>('file');

  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  const submitState = useMemo<SubmitState>(() => location.state as SubmitState, [location.state]);
  const submitParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

  const handleValidateServiceSelection = useCallback(() => {
    // to do
    console.log(form.store.state.values);
  }, []);

  const handleCancelUpload = useCallback(() => {
    form.setStore(s => ({ ...s, file: null, allowClick: true, uploadProgress: null, uuid: generateUUID() }));
    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <form.Subscribe
        selector={state => [state.canSubmit, state.isSubmitting, state.values.validate]}
        children={([canSubmit, isSubmitting, validate]) => (
          <ConfirmationDialog
            open={validate}
            // handleClose={event => setValidate(false)}
            handleClose={() => form.store.setState(s => ({ ...s, validate: false }))}
            // handleCancel={cleanupServiceSelection}
            // handleAccept={executeCB}
            handleAccept={() => {}}
            title={t('validate.title')}
            cancelText={t('validate.cancelText')}
            acceptText={t('validate.acceptText')}
            text={t('validate.text')}
          />
        )}
      />

      <div style={{ marginBottom: !downSM && !configuration.ui.banner ? '2rem' : null }}>{banner}</div>

      {configuration.ui.banner && (
        <Alert severity={configuration.ui.banner_level} style={{ marginBottom: '2rem' }}>
          {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
        </Alert>
      )}

      {c12nDef.enforce ? (
        <form.Field
          name="settings.classification"
          children={({ state, handleBlur, handleChange }) => (
            <div style={{ paddingBottom: sp4 }}>
              <div style={{ padding: sp1, fontSize: 16 }}>{t('classification')}</div>
              <Classification
                format="long"
                type="picker"
                c12n={state.value ? state.value : null}
                setClassification={classification => handleChange(classification)}
                disabled={!currentUser.roles.includes('submission_create')}
              />
            </div>
          )}
        />
      ) : null}

      <TabContainer
        indicatorColor="primary"
        textColor="primary"
        paper
        centered
        variant="standard"
        style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
        tabs={{
          file: {
            label: t('file'),
            inner: (
              <FileSubmit
                onValidateServiceSelection={handleValidateServiceSelection}
                onCancelUpload={handleCancelUpload}
              />
            )
          },
          hash: {
            label: `${t('urlHash.input_title')}${t('urlHash.input_suffix')}`,
            disabled: !currentUser.roles.includes('submission_create'),
            inner: <HashSubmit onValidateServiceSelection={handleValidateServiceSelection} />
          },
          options: {
            label: t('options'),
            inner: (
              <Grid container columnGap={2}>
                <Grid item xs={12} md>
                  <ServiceSelection />
                  {/* <ServiceParameters /> */}
                </Grid>
                <Grid item xs={12} md>
                  <SubmissionParameters />
                  <MetadataParameters />
                </Grid>
              </Grid>
            )
          }
        }}
      />
    </PageCenter>
  );
};

const SubmitContent = React.memo(WrappedSubmitContent);

const WrappedSubmitPage = () => (
  <FormProvider>
    <SubmitContent />
  </FormProvider>
);

export const SubmitPage = React.memo(WrappedSubmitPage);
export default SubmitPage;
