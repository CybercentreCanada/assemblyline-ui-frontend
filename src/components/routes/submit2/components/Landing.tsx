import PublishIcon from '@mui/icons-material/Publish';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { Alert, CircularProgress, ListItemText, Button as MuiButton, Typography, useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { File } from 'components/models/base/file';
import type { SearchResult } from 'components/models/ui/search';
import { getProfileNames } from 'components/routes/settings/settings.utils';
import type { SubmitStore } from 'components/routes/submit2/submit.form';
import { FLOW, useForm } from 'components/routes/submit2/submit.form';
import { calculateFileHash, getHashQuery, switchProfile } from 'components/routes/submit2/submit.utils';
import { Button } from 'components/visual/Buttons/Button';
import Classification from 'components/visual/Classification';
import FileDropper from 'components/visual/FileDropper';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { TabContainer } from 'components/visual/TabContainer';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
            setFile={(value: SubmitStore['file']) => {
              form.setFieldValue('file', value);

              calculateFileHash(value)
                .then((hash: string) =>
                  form.setFieldValue('file', f => {
                    f.hash = hash;
                    return f;
                  })
                )
                .catch(e => console.error(e));
            }}
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

const FindButton = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();
  const { apiCall } = useMyAPI();

  const [type, setType] = useState<SubmitStore['hash']['type'] | 'file'>(null);
  const [hash, setHash] = useState<string>(null);
  const [results, setResults] = useState<SearchResult<File>>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    if (!type || !hash || !open) return;

    apiCall<SearchResult<File>>({
      method: 'POST',
      url: '/api/v4/search/file/',
      body: {
        query: getHashQuery(type, hash),
        offset: 0,
        rows: 1
      },
      onSuccess: api_data => setResults(api_data.api_response),
      onEnter: () => setFetching(true),
      onExit: () => setFetching(false)
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, open, type]);

  return (
    <>
      <form.Subscribe
        selector={state => [state.values.state.tab, state.values.file, state.values.hash.type]}
        children={([tab, file, hashType]) =>
          (tab === 'file' && !file) || (tab === 'hash' && !hashType) ? null : (
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>
                <ListItemText
                  primary={
                    <>
                      <span>{'Find '}</span>
                      {tab === 'file' ? (
                        'File'
                      ) : (
                        <span style={{ textTransform: 'uppercase' }}>{hashType as string}</span>
                      )}
                    </>
                  }
                  secondary={tab === 'file' ? (file as SubmitStore['file']).hash : hash}
                  primaryTypographyProps={{ variant: 'h6' }}
                />
              </DialogTitle>
              <DialogContent>
                {fetching ? (
                  <Alert
                    variant="outlined"
                    icon={<CircularProgress style={{ height: '22px', width: '22px' }} />}
                    sx={{
                      color: theme.palette.text.secondary,
                      border: `1px solid ${theme.palette.text.secondary}`
                    }}
                  >
                    {'Searching for matching files'}
                  </Alert>
                ) : results.total > 0 ? (
                  <Alert
                    variant="outlined"
                    severity="success"
                    sx={{ backgroundColor: `${theme.palette.success.main}10` }}
                  >
                    {'A file matching your input was found!'}
                  </Alert>
                ) : (
                  <Alert variant="outlined" severity="error" sx={{ backgroundColor: `${theme.palette.error.main}10` }}>
                    {'No files matching your input were found.'}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <div style={{ flex: 1 }}>
                  <Button onClick={() => setOpen(false)}>{'Close'}</Button>
                </div>

                <MuiButton
                  component={Link}
                  autoFocus
                  to={`/file/detail/${results?.items?.[0]?.sha256}`}
                  disabled={fetching || !results?.items?.[0]?.sha256}
                  onClick={() => setOpen(false)}
                >
                  {'Navigate to File'}
                </MuiButton>
              </DialogActions>
            </Dialog>
          )
        }
      />
      <form.Subscribe
        selector={state => [
          state.values.state.loading,
          state.values.state.disabled,
          state.values.state.uploading,
          state.values.state.customize,
          state.values.state.tab,
          state.values.file,
          state.values.hash.type,
          state.values.hash.value
        ]}
        children={([loading, disabled, uploading, customize, tab, file, hashType, hashValue]) => (
          <Button
            color="secondary"
            disabled={(disabled || (tab === 'file' ? !file : tab === 'hash' ? !hashType : false)) as boolean}
            loading={(loading || uploading) as boolean}
            startIcon={<SearchIcon />}
            preventRender={!customize}
            tooltip={t('find.button.tooltip')}
            tooltipProps={{ placement: 'bottom' }}
            variant="contained"
            onClick={() => {
              setOpen(true);

              if (tab === 'file') {
                setType('file');
                setHash((file as SubmitStore['file']).hash);
              } else if (tab === 'hash') {
                setType(hashType as SubmitStore['hash']['type'] | 'file');
                setHash(hashValue as string);
              }
            }}
          >
            {t('find.button.label')}
          </Button>
        )}
      />
    </>
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

  const handleOpenConfirmation = useCallback(() => {
    const tab = form.getFieldValue('state.tab');
    const hashType = form.getFieldValue('hash.type');
    form.setFieldValue('state.confirmation', s => !s);

    if (tab === 'file') {
      form.setFieldValue('settings.description.value', `Inspection of file: ${form.getFieldValue('file.name')}`);
    } else if (tab === 'hash') {
      form.setFieldValue(
        'settings.description.value',
        `Inspection of ${form.getFieldValue('hash.type').toUpperCase()}: ${form.getFieldValue('hash.value')}`
      );
    }

    if (tab === 'hash' && hashType === 'url') {
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
  }, [configuration.ui.url_submission_auto_service_selection, form]);

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
          onClick={() => handleOpenConfirmation()}
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

            <FindButton />
            <AdjustButton />
            <AnalyzeButton />
          </div>

          <ToS />
        </div>
      </div>
    );
  })
);
