import PublishIcon from '@mui/icons-material/Publish';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { Alert, CircularProgress, ListItemText, Button as MuiButton, Typography, useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import { IconButton } from 'components/visual/Buttons/IconButton';
import Classification from 'components/visual/Classification';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { getSubmitType } from 'helpers/utils';
import generateUUID from 'helpers/uuid';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FileDropper from './FileDropper';

export const ClassificationInput = React.memo(() => {
  const { t } = useTranslation(['submit2']);
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
          <Typography>{t('classification.input.label')}</Typography>
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

export const FileInput = React.memo(() => {
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
                // eslint-disable-next-line no-console
                .catch(e => console.error(e));
            }}
            disabled={(loading || disabled || uploading) as boolean}
          />
        </div>
      )}
    />
  );
});

export const HashInput = React.memo(() => {
  const { t } = useTranslation(['submit2']);
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

export const SubmissionProfileInput = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const { configuration, settings } = useALContext();
  const form = useForm();

  const options = useMemo<{ value: string; primary: string; secondary: string }[]>(
    () =>
      getProfileNames(settings).map(profileValue => ({
        value: profileValue,
        primary:
          profileValue === 'default'
            ? t('profile.option.custom.label')
            : configuration.submission.profiles[profileValue].display_name,
        secondary:
          profileValue === 'default'
            ? t('profile.option.custom.description')
            : configuration.submission.profiles[profileValue].description
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
      )}
    />
  );
});

export const CancelButton = React.memo(() => {
  const { t } = useTranslation(['submit2']);
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
          tooltip={t('cancel.button.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
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
          {t('cancel.button.label')}
        </Button>
      )}
    />
  );
});

export const FindButton = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const form = useForm();
  const { apiCall } = useMyAPI();

  const [results, setResults] = useState<SearchResult<File>>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [query, setQuery] = useState<string>(null);
  const [prevQuery, setPrevQuery] = useState<string>(null);

  useEffect(() => {
    if (!open || query === prevQuery) return;

    setPrevQuery(query);

    apiCall<SearchResult<File>>({
      method: 'POST',
      url: '/api/v4/search/file/',
      body: {
        query: query,
        offset: 0,
        rows: 1
      },
      onSuccess: api_data => setResults(api_data.api_response),
      onEnter: () => setFetching(true),
      onExit: () => setFetching(false)
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prevQuery, query]);

  return (
    <>
      <form.Subscribe
        selector={state => [state.values.state.tab, state.values.file, state.values.hash.type, state.values.hash.value]}
        children={([tab, file, hashType, hashValue]) =>
          (tab === 'file' && !file) || (tab === 'hash' && !hashType) ? null : (
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>
                <ListItemText
                  primary={
                    <>
                      {t('find.button.title')}
                      {tab === 'file' ? (
                        'File'
                      ) : (
                        <span style={{ textTransform: 'uppercase' }}>{hashType as string}</span>
                      )}
                    </>
                  }
                  secondary={tab === 'file' ? (file as SubmitStore['file']).hash : (hashValue as string)}
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
                    {t('find.searching.title')}
                  </Alert>
                ) : results.total > 0 ? (
                  <Alert
                    variant="outlined"
                    severity="success"
                    sx={{ backgroundColor: `${theme.palette.success.main}10` }}
                  >
                    {t('find.found.title')}
                  </Alert>
                ) : (
                  <Alert variant="outlined" severity="error" sx={{ backgroundColor: `${theme.palette.error.main}10` }}>
                    {t('find.not_found.title')}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}> {t('find.close.title')}</Button>

                <MuiButton
                  component={Link}
                  autoFocus
                  to={`/file/detail/${results?.items?.[0]?.sha256}`}
                  disabled={fetching || !results?.items?.[0]?.sha256}
                  onClick={() => setOpen(false)}
                >
                  {t('find.link.title')}
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
          <IconButton
            disabled={(disabled || (tab === 'file' ? !file : tab === 'hash' ? !hashType : false)) as boolean}
            loading={(loading || uploading) as boolean}
            preventRender={!customize}
            tooltip={t('find.button.tooltip')}
            tooltipProps={{ placement: 'bottom' }}
            onClick={() => {
              setOpen(true);

              if (tab === 'file') {
                setQuery(getHashQuery('file', (file as SubmitStore['file']).hash));
              } else if (tab === 'hash') {
                setQuery(getHashQuery(hashType as SubmitStore['hash']['type'] | 'file', hashValue as string));
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        )}
      />
    </>
  );
});

export const AdjustButton = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.uploading,
        state.values.state.customize,
        state.values.state.adjust
      ]}
      children={([loading, disabled, uploading, customize, adjust]) => (
        <IconButton
          disabled={disabled}
          loading={loading || uploading}
          preventRender={!customize}
          tooltip={adjust ? t('adjust.button.close.tooltip') : t('adjust.button.open.tooltip')}
          tooltipProps={{ placement: 'bottom' }}
          onClick={() => form.setFieldValue('state.adjust', s => !s)}
        >
          <TuneIcon />
        </IconButton>
      )}
    />
  );
});

export const AnalyzeButton = React.memo(() => {
  const { t } = useTranslation(['submit2']);
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
          onClick={() => form.setFieldValue('state.confirmation', s => !s)}
        >
          {t('analyze.button.label')}
        </Button>
      )}
    />
  );
});

export const ToS = React.memo(() => {
  const { t } = useTranslation(['submit2']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return !configuration.ui.tos ? null : (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="body2">
        {t('tos.terms1')}
        <i>{t('analyze.button.label')}</i>
        {t('tos.terms2')}
        <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
          {t('tos.terms3')}
        </Link>
        .
      </Typography>
    </div>
  );
});
