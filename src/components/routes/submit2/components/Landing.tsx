import PublishIcon from '@mui/icons-material/Publish';
import TuneIcon from '@mui/icons-material/Tune';
import { Alert, Typography, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import type { SubmitStore } from 'components/routes/submit2/submit.form';
import { FLOW, useForm } from 'components/routes/submit2/submit.form';
import { switchProfile } from 'components/routes/submit2/submit.utils';
import { Button } from 'components/visual/Buttons/Button';
import Classification from 'components/visual/Classification';
import FileDropper from 'components/visual/FileDropper';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { TabContainer } from 'components/visual/TabContainer';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Banner = React.memo(() => {
  const banner = useAppBanner();
  return banner;
});

const BannerAlert = React.memo(() => {
  const { i18n } = useTranslation(['submit']);
  const { configuration } = useALContext();

  return (
    configuration.ui.banner && (
      <Alert severity={configuration.ui.banner_level}>
        {configuration.ui.banner[i18n.language] ? configuration.ui.banner[i18n.language] : configuration.ui.banner.en}
      </Alert>
    )
  );
});

const ClassificationInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { c12nDef } = useALContext();

  const form = useForm();

  return !c12nDef?.enforce ? null : (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.customize,
        state.values.state.uploading,
        state.values.settings?.classification?.value,
        state.values.settings?.classification?.editable
      ]}
      children={([loading, disabled, customize, uploading, value, editable]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
          <Typography>{t('classification')}</Typography>
          <Classification
            format="long"
            type="picker"
            c12n={loading ? null : (value as string)}
            disabled={(disabled || uploading || !(customize || editable)) as boolean}
            setClassification={v => form.setFieldValue('settings.classification.value', v)}
          />
        </div>
      )}
    />
  );
});

const FileInput = React.memo(() => {
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.uploading,
        state.values.file
      ]}
      children={([loading, disabled, uploading, file]) => (
        <div style={{ width: '100%' }}>
          <FileDropper
            file={file as SubmitStore['file']}
            setFile={(value: SubmitStore['file']) => form.setFieldValue('file', value)}
            disabled={(loading || disabled || uploading) as boolean}
          />
        </div>
      )}
    />
  );
});

const HashInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const { closeSnackbar } = useMySnackbar();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.uploading,
        state.values.hash.type,
        state.values.hash.value
      ]}
      children={([loading, disabled, uploading, type, value]) => (
        <TextInput
          id={'Hash Input'}
          label={configuration.ui.allow_url_submissions ? t('url.input.label') : t('hash.input.label')}
          helperText={configuration.ui.allow_url_submissions ? t('url.input.helperText') : ''}
          value={value as string}
          loading={loading as boolean}
          disabled={(disabled || uploading) as boolean}
          sx={{ flex: 1 }}
          onChange={(e, v) => {
            closeSnackbar();
            const [nextType, nextValue] = getSubmitType(v, configuration);
            form.setFieldValue('hash.type', nextType);
            form.setFieldValue('hash.value', nextValue);
          }}
          endAdornment={
            <Typography
              color={type ? 'primary' : 'disabled'}
              fontFamily="Consolas, Courier New monospace"
              textTransform="uppercase"
              children={type}
            />
          }
        />
      )}
    />
  );
});

const SubmissionProfileInput = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration, settings } = useALContext();
  const form = useForm();

  const options = useMemo<{ value: string; primary: string; secondary: string }[]>(
    () =>
      getProfileNames(settings).map(profileValue => ({
        value: profileValue,
        primary:
          profileValue === 'default'
            ? t(`profile.custom`)
            : configuration.submission.profiles[profileValue].display_name,
        secondary:
          profileValue === 'default' ? t(`profile.custom`) : configuration.submission.profiles[profileValue].description
      })),
    [configuration.submission.profiles, settings, t]
  );

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.uploading,
        state.values.state.profile
      ]}
      children={([loading, disabled, uploading, value]) => (
        <div style={{ flex: 1 }}>
          <SelectInput
            id="submission profile name"
            label={t('profile.input.label')}
            value={value as string}
            loading={loading as boolean}
            disabled={(disabled || uploading) as boolean}
            options={options}
            onChange={(e, profile: string) => {
              form.setFieldValue('state.profile', profile);
              form.setFieldValue('settings', s => switchProfile(s, configuration, settings, profile));
            }}
          />
        </div>
      )}
    />
  );
});

const CancelButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.tab,
        !state.values.file,
        !state.values.hash.type
      ]}
      children={([loading, disabled, tab, file, hash]) => (
        <Button
          color="primary"
          disabled={(disabled || (tab === 'file' ? file : tab === 'hash' ? hash : false)) as boolean}
          loading={loading as boolean}
          variant="outlined"
          onClick={() => {
            form.setFieldValue('file', null);
            form.setFieldValue('hash.type', null);
            form.setFieldValue('hash.value', '');
            form.setFieldValue('state.uploading', false);
            form.setFieldValue('state.uploadProgress', null);
            form.setFieldValue('state.uuid', generateUUID());

            FLOW.cancel();
            FLOW.off('complete');
            FLOW.off('fileError');
            FLOW.off('progress');
          }}
        >
          {t('file.cancel')}
        </Button>
      )}
    />
  );
});

const AdjustButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.uploading,
        state.values.state.customize,
        state.values.state.tab,
        !state.values.file,
        !state.values.hash.type
      ]}
      children={([loading, disabled, uploading, customize, tab, file, hash]) => (
        <Button
          color="secondary"
          disabled={(disabled || (tab === 'file' ? file : tab === 'hash' ? hash : false)) as boolean}
          loading={(loading || uploading) as boolean}
          startIcon={<TuneIcon />}
          preventRender={!customize}
          tooltip={t('adjust.button.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          variant="contained"
          onClick={() => form.setFieldValue('state.adjust', s => !s)}
        >
          {t('adjust.button.label')}
        </Button>
      )}
    />
  );
});

export const AnalyzeButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.uploading,
        state.values.state.tab,
        !state.values.file,
        !state.values.hash.type
      ]}
      children={([loading, disabled, uploading, tab, file, hash]) => (
        <Button
          disabled={(disabled || (tab === 'file' ? file : tab === 'hash' ? hash : false)) as boolean}
          loading={(loading || uploading) as boolean}
          startIcon={<PublishIcon />}
          tooltip={t('analyze.button.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          variant="contained"
          onClick={() => {
            form.setFieldValue('state.confirmation', s => !s);

            if (tab === 'file') {
              form.setFieldValue(
                'settings.description.value',
                `Inspection of file: ${form.getFieldValue('file.name')}`
              );
            } else if (tab === 'hash') {
              form.setFieldValue(
                'settings.description.value',
                `Inspection of ${form.getFieldValue('hash.type').toUpperCase()}: ${form.getFieldValue('hash.value')}`
              );
            }

            if (tab === 'hash' && (hash as SubmitStore['hash']['type']) === 'url') {
              form.setFieldValue('settings.services', categories => {
                categories.forEach((category, i) => {
                  category.services.forEach((service, j) => {
                    if (configuration.ui.url_submission_auto_service_selection.includes(service.name)) {
                      categories[i].services[j].selected = true;
                    }
                  });
                  categories[i].selected = categories[i].services.every(svr => svr.selected);
                });
                return categories;
              });
            }
          }}
        >
          {t('analyze.button.label')}
        </Button>
      )}
    />
  );
});

const ToS = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return !configuration.ui.tos ? null : (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="body2">
        {t('terms1')}
        <i>{t('analyze.button.label')}</i>
        {t('terms2')}
        <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
          {t('terms3')}
        </Link>
        .
      </Typography>
    </div>
  );
});

type Props = React.HTMLAttributes<HTMLDivElement> & {
  hidden?: boolean;
};

export const Landing = React.memo(
  React.forwardRef(({ hidden = false, ...props }: Props, ref: React.LegacyRef<HTMLDivElement>) => {
    const { t } = useTranslation(['submit']);
    const theme = useTheme();
    const { configuration } = useALContext();

    const form = useForm();

    return (
      <div
        {...props}
        ref={ref}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: '0',
          left: '0',
          ...props?.style,
          ...(hidden && { maxHeight: '0px', overflow: 'hidden' })
        }}
      >
        <Banner />
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(4) }}>
          <BannerAlert />
          <ClassificationInput />

          <form.Subscribe
            selector={state => [state.values.state.loading, state.values.state.disabled, state.values.state.tab]}
            children={([loading, disabled, type]) => (
              <TabContainer
                paper
                centered
                variant="standard"
                style={{ margin: '0px' }}
                value={type as SubmitStore['state']['tab']}
                onChange={(e, v: SubmitStore['state']['tab']) => form.setFieldValue('state.tab', v)}
                tabs={{
                  file: {
                    label: t('file'),
                    disabled: (disabled || loading) as boolean,
                    inner: <FileInput />
                  },
                  hash: {
                    label: configuration.ui.allow_url_submissions ? t('url.input.title') : t('hash.input.title'),
                    disabled: (disabled || loading) as boolean,
                    inner: <HashInput />
                  }
                }}
              />
            )}
          />

          <SubmissionProfileInput />

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing(2),
              textAlign: 'left'
            }}
          >
            <div style={{ flex: 1 }}>
              <CancelButton />
            </div>

            <AdjustButton />
            <AnalyzeButton />
          </div>

          <ToS />
        </div>
      </div>
    );
  })
);
