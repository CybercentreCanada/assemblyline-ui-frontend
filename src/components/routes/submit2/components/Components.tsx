import PublishIcon from '@mui/icons-material/Publish';
import TuneIcon from '@mui/icons-material/Tune';
import { Alert, Typography, useMediaQuery, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { SubmitStore } from 'components/routes/submit/submit.form';
import { FLOW, useForm } from 'components/routes/submit/submit.form';
import { Button } from 'components/visual/Buttons/Button';
import Classification from 'components/visual/Classification';
import FileDropper from 'components/visual/FileDropper';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const ToS = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return !configuration.ui.tos ? null : (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="body2">
        {t('terms1')}
        <i>{t('urlHash.button')}</i>
        {t('terms2')}
        <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
          {t('terms3')}
        </Link>
        .
      </Typography>
    </div>
  );
});

export const Banner = React.memo(() => {
  const banner = useAppBanner();
  const theme = useTheme();
  const { configuration } = useALContext();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  return banner;

  return <div style={{ marginBottom: !downSM && !configuration.ui.banner ? '2rem' : null }}>{banner}</div>;
});

export const BannerAlert = React.memo(() => {
  const { i18n } = useTranslation(['submit']);
  const { configuration } = useALContext();

  return (
    configuration.ui.banner && (
      <Alert severity={configuration.ui.banner_level}>
        {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
      </Alert>
    )
  );

  return (
    configuration.ui.banner && (
      <Alert severity={configuration.ui.banner_level} style={{ marginBottom: '2rem' }}>
        {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
      </Alert>
    )
  );
});

export const SubmitClassification = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { user: currentUser, c12nDef } = useALContext();

  const form = useForm();

  return !c12nDef?.enforce ? null : (
    <form.Subscribe
      selector={state => state.values?.settings?.classification?.value}
      children={c12n =>
        !c12n ? null : (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            <Typography>{t('classification')}</Typography>
            <Classification
              format="long"
              type="picker"
              c12n={c12n}
              setClassification={v => form.setFieldValue('settings.classification', v)}
              disabled={!currentUser.roles.includes('submission_create')}
            />
          </div>
        )
      }
    />
  );

  return !c12nDef?.enforce ? null : (
    <form.Subscribe
      selector={state => state.values?.settings?.classification}
      children={c12n =>
        !c12n ? null : (
          <div style={{ paddingBottom: theme.spacing(4) }}>
            <div style={{ padding: theme.spacing(1), fontSize: 16 }}>{t('classification')}</div>
            <Classification
              format="long"
              type="picker"
              c12n={c12n}
              setClassification={v => form.setFieldValue('settings.classification', v)}
              disabled={!currentUser.roles.includes('submission_create')}
            />
          </div>
        )
      }
    />
  );
});

export const ExternalSources = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.hash.type, state.values.state.loading, state.values.state.disabled]}
      children={props => {
        const type = props[0] as SubmitStore['hash']['type'];
        const loading = props[1] as boolean;
        const disabled = props[2] as boolean;

        return (
          configuration.submission.file_sources?.[type]?.sources?.length > 0 && (
            <div style={{ textAlign: 'start' }}>
              <Typography variant="subtitle1">{t('options.submission.default_external_sources')}</Typography>
              {configuration.submission.file_sources?.[type]?.sources?.map((source, i) => (
                <form.Subscribe
                  key={`${source}-${i}`}
                  selector={state => state.values?.settings?.default_external_sources?.indexOf(source) !== -1}
                  children={value => (
                    <CheckboxInput
                      key={i}
                      id={`source-${source.replace('_', ' ')}`}
                      label={source.replace('_', ' ')}
                      labelProps={{ textTransform: 'capitalize' }}
                      value={value}
                      loading={loading}
                      disabled={disabled}
                      disableGap
                      onChange={() => {
                        if (!form.getFieldValue('settings')) return;

                        const newSources = form.getFieldValue('settings.default_external_sources');
                        if (newSources.indexOf(source) === -1) newSources.push(source);
                        else newSources.splice(newSources.indexOf(source), 1);

                        form.setFieldValue('hash.hasError', false);
                        form.setFieldValue('settings.default_external_sources', newSources);
                      }}
                    />
                  )}
                />
              ))}
            </div>
          )
        );
      }}
    />
  );
});

export const CancelButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  const handleClick = useCallback(() => {
    form.setFieldValue('file', null);

    form.setFieldValue('hash.type', null);
    form.setFieldValue('hash.value', '');
    form.setFieldValue('hash.hasError', false);

    form.setFieldValue('state.isUploading', false);
    form.setFieldValue('state.uploadProgress', null);
    form.setFieldValue('state.uuid', generateUUID());

    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, !state.values.file, !state.values.hash.type]}
      children={props => {
        const tab = props[0] as 'hash' | 'file' | 'options';
        const file = props[1] as boolean;
        const hash = props[2] as boolean;

        return (
          <Button
            color="primary"
            variant="outlined"
            disabled={tab === 'file' ? file : tab === 'hash' ? hash : false}
            onClick={handleClick}
          >
            {t('file.cancel')}
          </Button>
        );
      }}
    />
  );
});

export const AdjustButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, !state.values.file, !state.values.hash.type]}
      children={props => {
        const tab = props[0] as 'hash' | 'file' | 'options';
        const file = props[1] as boolean;
        const hash = props[2] as boolean;

        return (
          <Button
            disabled={tab === 'file' ? file : tab === 'hash' ? hash : false}
            color="secondary"
            variant="contained"
            tooltip={t('adjust.button.tooltip')}
            tooltipProps={{ placement: 'bottom' }}
            startIcon={<TuneIcon />}
          >
            {t('adjust.button.label')}
          </Button>
        );
      }}
    />
  );
});

export const AnalyzeButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { user: currentUser, configuration } = useALContext();
  const form = useForm();

  const handleClick = useCallback(() => {
    form.setFieldValue('state.isConfirmationOpen', true);

    // const showValidate = store.settings.profiles[profile].services.some(cat =>
    //   cat.services.some(svr => svr.selected && svr.is_external)
    // );

    // if (showValidate && !store.state.isConfirmationOpen) {
    //   form.setStore(s => {
    //     s.state.isConfirmationOpen = true;
    //     return s;
    //   });
    // } else {
    //   form.setStore(s => {
    //     s.state.isConfirmationOpen = false;
    //     return s;
    //   });

    //   handleSubmitFile();
    // }
  }, [form]);

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, !state.values.file, !state.values.hash.type]}
      children={props => {
        const tab = props[0] as 'hash' | 'file' | 'options';
        const file = props[1] as boolean;
        const hash = props[2] as boolean;

        return (
          <Button
            disabled={tab === 'file' ? file : tab === 'hash' ? hash : false}
            variant="contained"
            tooltip={t('analyze.button.tooltip')}
            tooltipProps={{ placement: 'bottom' }}
            startIcon={<PublishIcon />}
            onClick={handleClick}
          >
            {t('analyze.button.label')}
          </Button>
        );
      }}
    />
  );

  return (
    <form.Subscribe
      selector={state => [!!state.values.file, state.values.state.isUploading, state.values.state.uploadProgress]}
      children={([file, isUploading, uploadProgress]) => (
        <Button
          disabled={isUploading as boolean}
          color="primary"
          variant="contained"
          onClick={handleConfirm}
          style={{ alignSelf: 'end' }}
        >
          {'Analyze'}
          {!isUploading ? t('file.button') : `${uploadProgress}${t('submit.progress')}`}
        </Button>
      )}
    />
  );
});

export const FileInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { user: currentUser, configuration } = useALContext();
  const form = useForm();

  return (
    <div style={{ width: '100%' }}>
      <form.Subscribe
        selector={state => state.values.file}
        children={file => (
          <FileDropper
            file={file}
            setFile={(value: SubmitStore['file']) => form.setFieldValue('file', value)}
            disabled={form.state.values.state.isUploading || !currentUser.roles.includes('submission_create')}
          />
        )}
      />
    </div>
  );
});

export const HashInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { closeSnackbar } = useMySnackbar();
  const { configuration } = useALContext();
  const form = useForm();

  const handleChange = useCallback(
    (event: React.SyntheticEvent, v: string) => {
      closeSnackbar();
      const [type, value] = getSubmitType(v, configuration);

      form.setFieldValue('hash.type', type);
      form.setFieldValue('hash.value', value);
      form.setFieldValue('hash.hasError', false);

      if (type === 'url' && form.getFieldValue('hash.urlAutoSelect')) {
        form.setFieldValue('hash.urlAutoSelect', true);
      } else if (type !== 'url') {
        form.setFieldValue('hash.urlAutoSelect', false);

        // s.settings.profiles[profile].services.forEach((category, i) => {
        //   category.services.forEach((service, j) => {
        //     if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
        //       s.settings.profiles[profile].services[i].services[j].selected = true;
        //     }
        //   });
        //   s.settings.profiles[profile].services[i].selected = s.settings.profiles[profile].services[i].services.every(
        //     svr => svr.selected
        //   );
        // });
      }
    },
    [closeSnackbar, configuration, form]
  );

  return (
    <form.Subscribe
      selector={state => [state.values.hash.type, state.values.hash.value]}
      children={([type, value]) => (
        <TextInput
          label={configuration.ui.allow_url_submissions ? t('url.input.label') : t('hash.input.label')}
          value={value}
          helperText={configuration.ui.allow_url_submissions ? t('url.input.helperText') : null}
          endAdornment={
            <Typography
              color={type ? 'primary' : 'disabled'}
              fontFamily="Consolas, Courier New monospace"
              textTransform="uppercase"
              children={type}
            />
          }
          sx={{ flex: 1 }}
          onChange={handleChange}
        />
      )}
    />
  );
});
