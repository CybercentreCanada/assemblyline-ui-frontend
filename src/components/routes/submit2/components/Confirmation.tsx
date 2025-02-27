import type { PaperProps, TypographyProps } from '@mui/material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  ListItemText,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SubmitStore } from 'components/routes/submit2/submit.form';
import { useForm } from 'components/routes/submit2/submit.form';
import { ByteNumber } from 'components/visual/ByteNumber';
import Classification from 'components/visual/Classification';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type SectionProps = PaperProps & {
  primary: TypographyProps['children'];
  primaryProps?: TypographyProps;
};

const Section = React.memo(({ primary, primaryProps, children, ...props }: SectionProps) => {
  const theme = useTheme();

  return (
    <div>
      <Typography color="textSecondary" variant="body2" {...primaryProps}>
        {primary}
      </Typography>
      <Paper
        variant="outlined"
        {...props}
        sx={{
          backgroundColor: theme.palette.background.default,
          overflow: 'hidden',
          wordBreak: 'break-word',
          ...props?.sx
        }}
      >
        {children}
      </Paper>
    </div>
  );
});

const Title = React.memo(() => {
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, state.values.file, state.values.hash.type, state.values.hash.value]}
      children={props => {
        const tab = props[0] as SubmitStore['state']['tab'];
        const file = props[1] as SubmitStore['file'];
        const type = props[2] as SubmitStore['hash']['type'];
        const hash = props[3] as SubmitStore['hash']['value'];

        return (
          <DialogTitle>
            <ListItemText
              primary={
                <>
                  {tab === 'file' ? 'File' : <span style={{ textTransform: 'uppercase' }}>{type}</span>}
                  <span>{' Analysis Confirmation'}</span>
                </>
              }
              secondary={
                tab === 'file' ? (
                  <>
                    {file.name}
                    {' ('}
                    <ByteNumber component="span" bytes={file.size} variant="body2" />
                    {')'}
                  </>
                ) : (
                  hash
                )
              }
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </DialogTitle>
        );
      }}
    />
  );
});

const ClassificationInfo = React.memo(() => {
  const { user: currentUser, c12nDef } = useALContext();
  const form = useForm();

  return !c12nDef?.enforce ? null : (
    <form.Subscribe
      selector={state => state.values?.settings?.classification?.value}
      children={c12n =>
        !c12n ? null : (
          <Classification
            format="long"
            type="picker"
            size="small"
            c12n={c12n}
            setClassification={v => form.setFieldValue('settings.classification.value', v)}
            disabled={!currentUser.roles.includes('submission_create')}
          />
        )
      }
    />
  );
});

const SubmissionOptions = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.loading, state.values.state.disabled, state.values.state.customize]}
      children={([loading, disabled, customize]) => (
        <>
          <form.Subscribe
            selector={state => {
              const param = state.values.settings.description;
              return [param.value, param.default, param.editable];
            }}
            children={([value, defaultValue, editable]) => (
              <TextInput
                label={t('options.submission.desc')}
                value={value as string}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                onChange={(e, v) => form.setFieldValue('settings.description.value', v)}
              />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.priority;
                  return [param.value, param.default, param.editable];
                }}
                children={([value, defaultValue, editable]) => (
                  <>
                    <SelectInput
                      label={t('options.submission.priority')}
                      value={value as number}
                      fullWidth
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      reset={value !== defaultValue}
                      options={[
                        { primary: t('options.submission.priority.low'), value: 500 },
                        { primary: t('options.submission.priority.medium'), value: 1000 },
                        { primary: t('options.submission.priority.high'), value: 1500 }
                      ]}
                      onChange={(e, v) => form.setFieldValue('settings.priority.value', v as number)}
                      onReset={() => form.setFieldValue('settings.priority.value', defaultValue as number)}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <form.Subscribe
                selector={state => {
                  const param = state.values.settings.ttl;
                  return [param.value, param.default, param.editable];
                }}
                children={([value, defaultValue, editable]) => (
                  <NumberInput
                    label={`${t('options.submission.ttl')} (${
                      configuration.submission.max_dtl !== 0
                        ? `${t('options.submission.ttl.max')}: ${configuration.submission.max_dtl}`
                        : t('options.submission.ttl.forever')
                    })`}
                    tooltip={t('settings:submissions.ttl_desc')}
                    endAdornment={t('settings:submissions.ttl_days')}
                    value={value as number}
                    loading={loading}
                    disabled={disabled || (!customize && !editable)}
                    reset={value !== defaultValue}
                    min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                    max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                    onChange={(e, v) => form.setFieldValue('settings.ttl.value', v)}
                    onReset={() => form.setFieldValue('settings.ttl.value', defaultValue as number)}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Section primary={t('settings:submissions')} sx={{ padding: `${theme.spacing(1)} 0` }}>
            <form.Subscribe
              selector={state => {
                const param = state.values.settings.generate_alert;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.generate_alert')}
                  tooltip={t('settings:submissions.generate_alert_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.generate_alert.value', v)}
                  onReset={() => form.setFieldValue('settings.generate_alert.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_filtering;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.ignore_filtering')}
                  tooltip={t('settings:submissions.filtering_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.ignore_filtering.value', v)}
                  onReset={() => form.setFieldValue('settings.ignore_filtering.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_cache;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.ignore_cache')}
                  tooltip={t('settings:submissions.result_caching_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.ignore_cache.value', v)}
                  onReset={() => form.setFieldValue('settings.ignore_cache.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.ignore_recursion_prevention;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.ignore_recursion_prevention')}
                  tooltip={t('settings:submissions.recursion_prevention_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.ignore_recursion_prevention.value', v)}
                  onReset={() => form.setFieldValue('settings.ignore_recursion_prevention.value', defaultValue)}
                />
              )}
            />

            <form.Subscribe
              selector={state => {
                const param = state.values.settings.deep_scan;
                return [param.value, param.default, param.editable];
              }}
              children={([value, defaultValue, editable]) => (
                <CheckboxInput
                  label={t('options.submission.deep_scan')}
                  tooltip={t('settings:submissions.deep_scan_desc')}
                  value={value}
                  loading={loading}
                  disabled={disabled || (!customize && !editable)}
                  reset={value !== defaultValue}
                  labelProps={{ color: 'textPrimary' }}
                  onChange={(e, v) => form.setFieldValue('settings.deep_scan.value', v)}
                  onReset={() => form.setFieldValue('settings.deep_scan.value', defaultValue)}
                />
              )}
            />
          </Section>
        </>
      )}
    />
  );
});

const AdditionalOptions = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.tab === 'hash',
        state.values.hash.type,
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.customize
      ]}
      children={props => {
        const tab = props[0] as boolean;
        const type = props[1] as SubmitStore['hash']['type'];
        const loading = props[2] as boolean;
        const disabled = props[3] as boolean;
        const customize = props[4] as boolean;

        return (
          <Section primary={'Additional Options'} sx={{ padding: `${theme.spacing(1)} 0` }}>
            <form.Subscribe
              selector={state => [state.values.state.tab === 'file', state.values.settings.malicious]}
              children={([render, value]) => (
                <SwitchInput
                  label={t('malicious')}
                  labelProps={{ color: 'textPrimary' }}
                  tooltip={t('malicious.tooltip')}
                  value={value}
                  loading={loading}
                  disabled={disabled}
                  preventRender={false && !render}
                  onChange={(e, v) => form.setFieldValue('settings.malicious', v)}
                />
              )}
            />

            {configuration.submission.file_sources?.[type]?.sources?.map((source, i) => (
              <form.Subscribe
                key={`${source}-${i}`}
                selector={state => state.values?.settings?.default_external_sources?.indexOf(source) !== -1}
                children={value => (
                  <CheckboxInput
                    key={i}
                    id={`source-${source.replace('_', ' ')}`}
                    label={source.replace('_', ' ')}
                    labelProps={{
                      margin: `${theme.spacing(0.5)} 0`,
                      textTransform: 'capitalize',
                      variant: 'body2'
                    }}
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
          </Section>
        );
      }}
    />
  );
});

const SubmissionMetadata = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.metadata]}
      children={([metadata]) => {
        return (
          <Section primary={'Submission Metadata'} sx={{ padding: `${theme.spacing(1)} 0` }}>
            {/* {configuration.submission.file_sources?.[type]?.sources?.map((source, i) => (
                <form.Subscribe
                  key={`${source}-${i}`}
                  selector={state => state.values?.settings?.default_external_sources?.indexOf(source) !== -1}
                  children={value => (
                    <CheckboxInput
                      key={i}
                      id={`source-${source.replace('_', ' ')}`}
                      label={source.replace('_', ' ')}
                      labelProps={{
                        margin: `${theme.spacing(0.5)} 0`,
                        textTransform: 'capitalize',
                        variant: 'body2'
                      }}
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
              ))} */}
          </Section>
        );
      }}
    />
  );
});

const ExternalSources = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.tab === 'hash',
        state.values.hash.type,
        state.values.state.loading,
        state.values.state.disabled
      ]}
      children={props => {
        const tab = props[0] as boolean;
        const type = props[1] as SubmitStore['hash']['type'];
        const loading = props[2] as boolean;
        const disabled = props[3] as boolean;

        {
          /* <Typography variant="body1">{t('options.submission.default_external_sources')}</Typography> */
        }

        return !tab || !configuration.submission.file_sources?.[type]?.sources?.length ? null : (
          <Section primary={'Select these external sources'} sx={{ padding: `${theme.spacing(1)} 0` }}>
            {configuration.submission.file_sources?.[type]?.sources?.map((source, i) => (
              <form.Subscribe
                key={`${source}-${i}`}
                selector={state => state.values?.settings?.default_external_sources?.indexOf(source) !== -1}
                children={value => (
                  <CheckboxInput
                    key={i}
                    id={`source-${source.replace('_', ' ')}`}
                    label={source.replace('_', ' ')}
                    labelProps={{
                      margin: `${theme.spacing(0.5)} 0`,
                      textTransform: 'capitalize',
                      variant: 'body2'
                    }}
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
          </Section>
        );
      }}
    />
  );
});

const ExternalServices = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => {
        if (state.values.hash.type !== 'url') return [false, [], false, false];
        else {
          const svr = state.values?.settings?.services?.reduce((prev: [number, number][], category, i) => {
            category.services.forEach((service, j) => {
              if (configuration?.ui?.url_submission_auto_service_selection?.includes(service.name)) prev.push([i, j]);
            });
            return prev;
          }, []);

          return [true, svr, state.values.state.loading, state.values.state.disabled];
        }
      }}
      children={props => {
        const isURL = props[0] as boolean;
        const services = props[1] as [number, number][];
        const loading = props[2] as boolean;
        const disabled = props[3] as boolean;

        return !isURL || !services?.length ? null : (
          <Section
            primary={t('options.submission.url_submission_auto_service_selection')}
            sx={{ padding: `${theme.spacing(1)} 0` }}
          >
            {services.map(([cat, svr], i) => (
              <form.Subscribe
                key={i}
                selector={state => [state.values.settings.services[cat].services[svr]]}
                children={([service]) => (
                  <CheckboxInput
                    key={i}
                    id={`url_submission_auto_service_selection-${service.name.replace('_', ' ')}`}
                    label={service.name.replace('_', ' ')}
                    labelProps={{ textTransform: 'capitalize' }}
                    value={service.selected}
                    loading={loading}
                    disabled={disabled}
                    disableGap
                    onChange={() => {
                      form.setFieldValue('settings', s => {
                        s.services[cat].services[svr].selected = !service.selected;
                        s.services[cat].selected = s.services[cat].services.every(val => val.selected);
                        return s;
                      });
                    }}
                  />
                )}
              />
            ))}
          </Section>
        );
      }}
    />
  );
});

const SelectedServices = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <Section
      primary={'Selected Services'}
      sx={{
        padding: theme.spacing(1),
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: theme.spacing(1),
        rowGap: theme.spacing(0.5)
      }}
    >
      <form.Subscribe
        selector={state => [state.values.state.isConfirmationOpen, state.values.settings.services]}
        children={([open, categories]) =>
          !open
            ? null
            : (categories as SubmitStore['settings']['services']).map((cat, i) =>
                !cat.selected ? null : (
                  <div key={`${cat.name}-${i}`} style={{ display: 'contents' }}>
                    <Typography color="textSecondary" variant="body2">
                      {cat.name}
                    </Typography>
                    <Typography variant="body2">
                      {cat.services
                        .reduce((prev: string[], svr) => {
                          if (svr.selected) prev.push(svr.name);
                          return prev;
                        }, [] as string[])
                        .join(', ')}
                    </Typography>
                  </div>
                )
              )
        }
      />
    </Section>
  );
});

const ServiceParameters = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <Section
      primary={'Modified Service Parameters'}
      sx={{
        padding: theme.spacing(1),
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        columnGap: theme.spacing(1),
        rowGap: theme.spacing(1)
      }}
    >
      <form.Subscribe
        selector={state => [state.values.state.isConfirmationOpen, state.values.settings.service_spec]}
        children={([open, specs]) =>
          !open
            ? null
            : (specs as SubmitStore['settings']['service_spec'])
                .filter(spec => spec.params.some(param => param.value !== param.default))
                .map((spec, i) => (
                  <div key={`${spec.name}`} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography color="textSecondary" variant="body2">
                      {spec.name}
                    </Typography>

                    {spec.params
                      .filter(param => param.value !== param.default)
                      .map((param, j) => (
                        <div key={`${param.name}-${j}`}>
                          <Typography component="span" variant="body2" textTransform="capitalize">
                            {`${param.name.replace(/_/g, ' ')}: `}
                          </Typography>

                          {(() => {
                            switch (param.type) {
                              case 'bool':
                                return (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color:
                                        theme.palette.mode === 'dark'
                                          ? theme.palette.info.light
                                          : theme.palette.info.dark
                                    }}
                                  >
                                    {param.value ? 'true' : 'false'}
                                  </Typography>
                                );
                              case 'int':
                                return (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color:
                                        theme.palette.mode === 'dark'
                                          ? theme.palette.success.light
                                          : theme.palette.success.dark
                                    }}
                                  >
                                    {param.value}
                                  </Typography>
                                );
                              case 'str':
                                return (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color:
                                        theme.palette.mode === 'dark'
                                          ? theme.palette.warning.light
                                          : theme.palette.warning.dark
                                    }}
                                  >
                                    {`"${param.value}"`}
                                  </Typography>
                                );
                              case 'list':
                                return (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{
                                      color:
                                        theme.palette.mode === 'dark'
                                          ? theme.palette.warning.dark
                                          : theme.palette.warning.light
                                    }}
                                  >
                                    {`"${param.value}"`}
                                  </Typography>
                                );
                            }
                          })()}
                        </div>
                      ))}
                  </div>
                ))
        }
      />
    </Section>
  );
});

const ToS = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { configuration } = useALContext();

  return !configuration.ui.tos ? null : (
    <DialogContentText variant="body2" sx={{ textAlign: 'center' }}>
      {t('terms1')}
      <i>{t('urlHash.button')}</i>
      {t('terms2')}
      <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
        {t('terms3')}
      </Link>
      .
    </DialogContentText>
  );
});

export const AnalysisConfirmation = React.memo(() => {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.isConfirmationOpen]}
      children={([open]) => {
        return (
          <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            onClose={() => form.setFieldValue('state.isConfirmationOpen', false)}
          >
            <Title />

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1.5) }}>
              <ClassificationInfo />
              <SubmissionOptions />
              <AdditionalOptions />
              <SubmissionMetadata />
              {/* <ExternalSources />
              <ExternalServices /> */}
              <SelectedServices />
              <ServiceParameters />
            </DialogContent>

            <ToS />

            <DialogActions>
              <Button onClick={() => form.setFieldValue('state.isConfirmationOpen', false)}>{t('cancel')}</Button>
              <Button>{t('analyze')}</Button>
            </DialogActions>
          </Dialog>
        );
      }}
    />
  );
});
