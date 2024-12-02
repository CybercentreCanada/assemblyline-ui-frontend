import { List, Paper, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { ClassificationInput } from 'components/routes/settings/inputs/ClassificationInput';
import { InputContainer, InputContainerTitle, InputHeader, InputList } from 'components/routes/settings/inputs/Inputs';
import { NumberInput } from 'components/routes/settings/inputs/NumberInput';
import type { ProfileParam, SubmitSettings } from 'components/routes/settings/utils/utils';
import { useTranslation } from 'react-i18next';

type Props = {
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
};

export const SubmissionSection = ({
  customize = false,
  disabled = false,
  hidden = false,
  loading = false,
  profile = 'interface'
}: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <InputContainer hidden={hidden} style={{ rowGap: theme.spacing(1) }}>
      <InputHeader primary={{ children: t('submissions') }} secondary={{ children: t('submissions.description') }} />

      <InputList>
        <form.Subscribe
          selector={state => {
            const param = state.values.next.profiles[profile].classification;
            return [param.default, param.value, param.editable];
          }}
          children={([defaultValue, value, editable]) => {
            return (
              <ClassificationInput
                id="settings:submissions.classification"
                primary={t('settings:submissions.classification')}
                secondary={t('settings:submissions.classification_desc')}
                value={value as string}
                defaultValue={defaultValue as string}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                hidden={hidden}
                onChange={v => {
                  form.setStore(s => {
                    s.next.profiles[profile].classification.value = v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].classification.value = defaultValue as string;
                    return s;
                  });
                }}
              />
            );
          }}
        />

        <form.Subscribe
          selector={state => {
            const param = state.values.next.profiles[profile].ttl;
            return [param.default, param.value, param.editable];
          }}
          children={([defaultValue, value, editable]) => {
            return (
              <NumberInput
                id="settings:submissions.ttl"
                primary={t('settings:submissions.ttl')}
                secondary={t('settings:submissions.ttl_desc')}
                endAdornment={t('settings:submissions.ttl_days')}
                value={value as number}
                defaultValue={defaultValue as number}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                hidden={hidden}
                min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                onChange={event => {
                  form.setStore(s => {
                    s.next.profiles[profile].ttl.value = parseInt(event.target.value);
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].ttl.value = defaultValue as number;
                    return s;
                  });
                }}
              />
            );
          }}
        />

        <form.Subscribe
          selector={state => {
            const param = state.values.next.profiles[profile].deep_scan;
            return [param.default, param.value, param.editable];
          }}
          children={([defaultValue, value, editable]) => {
            return (
              <BooleanInput
                id="settings:submissions.deep_scan"
                primary={t('settings:submissions.deep_scan')}
                secondary={t('settings:submissions.deep_scan_desc')}
                value={value}
                defaultValue={defaultValue}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                hidden={hidden}
                onClick={() => {
                  form.setStore(s => {
                    const v = s.next.profiles[profile].deep_scan.value;
                    s.next.profiles[profile].deep_scan.value = !v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].deep_scan.value = defaultValue;
                    return s;
                  });
                }}
              />
            );
          }}
        />

        <form.Subscribe
          selector={state => {
            const param = state.values.next.profiles[profile].ignore_dynamic_recursion_prevention;
            return [param.default, param.value, param.editable];
          }}
          children={([defaultValue, value, editable]) => {
            return (
              <BooleanInput
                id="settings:submissions.dynamic_recursion"
                primary={t('settings:submissions.dynamic_recursion')}
                secondary={t('settings:submissions.dynamic_recursion_desc')}
                value={value}
                defaultValue={defaultValue}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                hidden={hidden}
                onClick={() => {
                  form.setStore(s => {
                    const v = s.next.profiles[profile].ignore_dynamic_recursion_prevention.value;
                    s.next.profiles[profile].ignore_dynamic_recursion_prevention.value = !v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].ignore_dynamic_recursion_prevention.value = defaultValue;
                    return s;
                  });
                }}
              />
            );
          }}
        />

        <form.Subscribe
          selector={state => {
            const param = state.values.next.profiles[profile].ignore_filtering;
            return [param.default, param.value, param.editable];
          }}
          children={([defaultValue, value, editable]) => {
            return (
              <BooleanInput
                id="settings:submissions.filtering"
                primary={t('settings:submissions.filtering')}
                secondary={t('settings:submissions.filtering_desc')}
                value={value}
                defaultValue={defaultValue}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                hidden={hidden}
                onClick={() => {
                  form.setStore(s => {
                    const v = s.next.profiles[profile].ignore_filtering.value;
                    s.next.profiles[profile].ignore_filtering.value = !v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].ignore_filtering.value = defaultValue;
                    return s;
                  });
                }}
              />
            );
          }}
        />

        <form.Subscribe
          selector={state => {
            const param = state.values.next.profiles[profile].generate_alert;
            return [param.default, param.value, param.editable];
          }}
          children={([defaultValue, value, editable]) => {
            return (
              <BooleanInput
                id="settings:submissions.generate_alert"
                primary={t('settings:submissions.generate_alert')}
                secondary={t('settings:submissions.generate_alert_desc')}
                value={value}
                defaultValue={defaultValue}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                hidden={hidden}
                onClick={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].generate_alert.value = !s.next.profiles[profile].generate_alert.value;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].generate_alert.value = defaultValue;
                    return s;
                  });
                }}
              />
            );
          }}
        />

        <form.Subscribe
          selector={state => {
            const param = state.values.next.profiles[profile].ignore_cache;
            return [param.default, param.value, param.editable];
          }}
          children={([defaultValue, value, editable]) => {
            return (
              <BooleanInput
                id="settings:submissions.result_caching"
                primary={t('settings:submissions.result_caching')}
                secondary={t('settings:submissions.result_caching_desc')}
                value={value}
                defaultValue={defaultValue}
                loading={loading}
                disabled={disabled || (!customize && !editable)}
                hidden={hidden}
                onClick={() => {
                  form.setStore(s => {
                    const v = s.next.profiles[profile].ignore_cache.value;
                    s.next.profiles[profile].ignore_cache.value = !v;
                    return s;
                  });
                }}
                onReset={() => {
                  form.setStore(s => {
                    s.next.profiles[profile].ignore_cache.value = defaultValue;
                    return s;
                  });
                }}
              />
            );
          }}
        />
      </InputList>
    </InputContainer>
  );

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.profile,
        state.values.state.hidden,
        state.values.state.customize
      ]}
      children={props => {
        const loading = props[0] as boolean;
        const disabled = props[1] as boolean;
        const profile = props[2] as keyof SubmitSettings['profiles'];
        const hidden = props[3] as boolean;
        const customize = props[4] as boolean;

        return !profile ||
          profile === 'interface' ||
          (hidden &&
            !Object.entries(form.state.values?.next?.profiles?.[profile] || {})
              .filter(([name]) =>
                [
                  'generate_alert',
                  'ignore_dynamic_recursion_prevention',
                  'ignore_filtering',
                  'ignore_cache',
                  'deep_scan',
                  'ttl',
                  'classification'
                ].includes(name)
              )
              .some(([, param]) => !!(param as ProfileParam<unknown>)?.editable)) ? null : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography id="submissions" className="Anchor" variant="h6">
              {t('submissions')}
            </Typography>

            <InputContainerTitle
              primary={{ children: t('submissions'), variant: 'h6' }}
              secondary={{ children: 'dasdasd' }}
            />

            <List
              component={p => <Paper {...p} elevation={4} component="ul" />}
              disablePadding
              sx={{
                '&>:not(:last-child)': {
                  borderBottom: `thin solid ${theme.palette.divider}`
                }
              }}
            >
              <form.Subscribe
                selector={state => {
                  const param = state.values.next.profiles[profile].classification;
                  return [param.default, param.value, param.editable];
                }}
                children={([defaultValue, value, editable]) => {
                  return (
                    <ClassificationInput
                      primary={t('settings:submissions.classification')}
                      secondary={t('settings:submissions.classification_desc')}
                      value={value as string}
                      defaultValue={defaultValue as string}
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      hidden={hidden}
                      onChange={v => {
                        form.setStore(s => {
                          s.next.profiles[profile].classification.value = v;
                          return s;
                        });
                      }}
                      onReset={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].classification.value = defaultValue as string;
                          return s;
                        });
                      }}
                    />
                  );
                }}
              />

              <form.Subscribe
                selector={state => {
                  const param = state.values.next.profiles[profile].ttl;
                  return [param.default, param.value, param.editable];
                }}
                children={([defaultValue, value, editable]) => {
                  return (
                    <NumberInput
                      primary={t('settings:submissions.ttl')}
                      secondary={t('settings:submissions.ttl_desc')}
                      endAdornment={t('settings:submissions.ttl_days')}
                      value={value as number}
                      defaultValue={defaultValue as number}
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      hidden={hidden}
                      min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                      max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                      onChange={event => {
                        form.setStore(s => {
                          s.next.profiles[profile].ttl.value = parseInt(event.target.value);
                          return s;
                        });
                      }}
                      onReset={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].ttl.value = defaultValue as number;
                          return s;
                        });
                      }}
                    />
                  );
                }}
              />

              <form.Subscribe
                selector={state => {
                  const param = state.values.next.profiles[profile].deep_scan;
                  return [param.default, param.value, param.editable];
                }}
                children={([defaultValue, value, editable]) => {
                  return (
                    <BooleanInput
                      primary={t('settings:submissions.deep_scan')}
                      secondary={t('settings:submissions.deep_scan_desc')}
                      value={value}
                      defaultValue={defaultValue}
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      hidden={hidden}
                      onClick={() => {
                        form.setStore(s => {
                          const v = s.next.profiles[profile].deep_scan.value;
                          s.next.profiles[profile].deep_scan.value = !v;
                          return s;
                        });
                      }}
                      onReset={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].deep_scan.value = defaultValue;
                          return s;
                        });
                      }}
                    />
                  );
                }}
              />

              <form.Subscribe
                selector={state => {
                  const param = state.values.next.profiles[profile].ignore_dynamic_recursion_prevention;
                  return [param.default, param.value, param.editable];
                }}
                children={([defaultValue, value, editable]) => {
                  return (
                    <BooleanInput
                      primary={t('settings:submissions.dynamic_recursion')}
                      secondary={t('settings:submissions.dynamic_recursion_desc')}
                      value={value}
                      defaultValue={defaultValue}
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      hidden={hidden}
                      onClick={() => {
                        form.setStore(s => {
                          const v = s.next.profiles[profile].ignore_dynamic_recursion_prevention.value;
                          s.next.profiles[profile].ignore_dynamic_recursion_prevention.value = !v;
                          return s;
                        });
                      }}
                      onReset={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].ignore_dynamic_recursion_prevention.value = defaultValue;
                          return s;
                        });
                      }}
                    />
                  );
                }}
              />

              <form.Subscribe
                selector={state => {
                  const param = state.values.next.profiles[profile].ignore_filtering;
                  return [param.default, param.value, param.editable];
                }}
                children={([defaultValue, value, editable]) => {
                  return (
                    <BooleanInput
                      primary={t('settings:submissions.filtering')}
                      secondary={t('settings:submissions.filtering_desc')}
                      value={value}
                      defaultValue={defaultValue}
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      hidden={hidden}
                      onClick={() => {
                        form.setStore(s => {
                          const v = s.next.profiles[profile].ignore_filtering.value;
                          s.next.profiles[profile].ignore_filtering.value = !v;
                          return s;
                        });
                      }}
                      onReset={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].ignore_filtering.value = defaultValue;
                          return s;
                        });
                      }}
                    />
                  );
                }}
              />

              <form.Subscribe
                selector={state => {
                  const param = state.values.next.profiles[profile].generate_alert;
                  return [param.default, param.value, param.editable];
                }}
                children={([defaultValue, value, editable]) => {
                  return (
                    <BooleanInput
                      primary={t('settings:submissions.generate_alert')}
                      secondary={t('settings:submissions.generate_alert_desc')}
                      value={value}
                      defaultValue={defaultValue}
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      hidden={hidden}
                      onClick={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].generate_alert.value =
                            !s.next.profiles[profile].generate_alert.value;
                          return s;
                        });
                      }}
                      onReset={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].generate_alert.value = defaultValue;
                          return s;
                        });
                      }}
                    />
                  );
                }}
              />

              <form.Subscribe
                selector={state => {
                  const param = state.values.next.profiles[profile].ignore_cache;
                  return [param.default, param.value, param.editable];
                }}
                children={([defaultValue, value, editable]) => {
                  return (
                    <BooleanInput
                      primary={t('settings:submissions.result_caching')}
                      secondary={t('settings:submissions.result_caching_desc')}
                      value={value}
                      defaultValue={defaultValue}
                      loading={loading}
                      disabled={disabled || (!customize && !editable)}
                      hidden={hidden}
                      onClick={() => {
                        form.setStore(s => {
                          const v = s.next.profiles[profile].ignore_cache.value;
                          s.next.profiles[profile].ignore_cache.value = !v;
                          return s;
                        });
                      }}
                      onReset={() => {
                        form.setStore(s => {
                          s.next.profiles[profile].ignore_cache.value = defaultValue;
                          return s;
                        });
                      }}
                    />
                  );
                }}
              />
            </List>
          </div>
        );
      }}
    />
  );
};
