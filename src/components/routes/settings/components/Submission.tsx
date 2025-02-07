import { useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { List } from 'components/visual/List/List';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { ClassificationListInput } from 'components/visual/ListInputs/ClassificationListInput';
import { NumberListInput } from 'components/visual/ListInputs/NumberListInput';
import { useTranslation } from 'react-i18next';

export const SubmissionSection = () => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration, c12nDef } = useALContext();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.customize,
        state.values.state.disabled,
        state.values.state.loading,
        state.values.state.tab
      ]}
      children={props => {
        const customize = props[0] as boolean;
        const disabled = props[1] as boolean;
        const loading = props[2] as boolean;
        const profile = props[3] as SettingsStore['state']['tab'];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            <PageSection
              id="submissions"
              primary={t('submissions')}
              secondary={t('submissions.description')}
              primaryProps={{ variant: 'h6' }}
              subheader
              anchor
            />

            <List inset>
              {c12nDef.enforce && (
                <form.Subscribe
                  selector={state => state.values?.next?.submission_profiles[profile]?.classification}
                  children={value => (
                    <ClassificationListInput
                      id="settings:submissions.classification"
                      primary={t('settings:submissions.classification')}
                      secondary={t('settings:submissions.classification_desc')}
                      value={value.value || value.default}
                      loading={loading}
                      disabled={disabled || !customize}
                      onChange={v => {
                        form.setStore(s => {
                          s.next.submission_profiles[profile].classification.value = v;
                          return s;
                        });
                      }}
                    />
                  )}
                />
              )}

              <form.Subscribe
                selector={state =>
                  state.values?.next?.submission_profiles?.[profile]?.ttl || {
                    value: null,
                    default: null,
                    editable: false
                  }
                }
                children={state => (
                  <NumberListInput
                    id="settings:submissions.ttl"
                    primary={t('settings:submissions.ttl')}
                    secondary={t('settings:submissions.ttl_desc')}
                    endAdornment={t('settings:submissions.ttl_days')}
                    value={state.value}
                    loading={loading}
                    disabled={disabled || (!customize && !state.editable)}
                    reset={state.default !== null && state.value !== state.default}
                    min={configuration.submission.max_dtl !== 0 ? 1 : 0}
                    max={configuration.submission.max_dtl !== 0 ? configuration.submission.max_dtl : 365}
                    onChange={(event, value) => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ttl = { ...state, value };
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ttl = { ...state, value: state.default };
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state =>
                  state.values?.next?.submission_profiles?.[profile]?.deep_scan || {
                    value: null,
                    default: null,
                    editable: false
                  }
                }
                children={state => (
                  <BooleanListInput
                    id="settings:submissions.deep_scan"
                    primary={t('settings:submissions.deep_scan')}
                    secondary={t('settings:submissions.deep_scan_desc')}
                    value={state.value}
                    loading={loading}
                    disabled={disabled || (!customize && !state.editable)}
                    reset={state.default !== null && state.value !== state.default}
                    onChange={(event, value) => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].deep_scan = { ...state, value };
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].deep_scan = { ...state, value: state.default };
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state =>
                  state.values?.next?.submission_profiles?.[profile]?.ignore_recursion_prevention || {
                    value: null,
                    default: null,
                    editable: false
                  }
                }
                children={state => (
                  <BooleanListInput
                    id="settings:submissions.recursion_prevention"
                    primary={t('settings:submissions.recursion_prevention')}
                    secondary={t('settings:submissions.recursion_prevention_desc')}
                    value={state.value}
                    loading={loading}
                    disabled={disabled || (!customize && !state.editable)}
                    reset={state.default !== null && state.value !== state.default}
                    onChange={(event, value) => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ignore_recursion_prevention = { ...state, value };
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ignore_recursion_prevention = {
                          ...state,
                          value: state.default
                        };
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state =>
                  state.values?.next?.submission_profiles?.[profile]?.ignore_filtering || {
                    value: null,
                    default: null,
                    editable: false
                  }
                }
                children={state => (
                  <BooleanListInput
                    id="settings:submissions.filtering"
                    primary={t('settings:submissions.filtering')}
                    secondary={t('settings:submissions.filtering_desc')}
                    value={state.value}
                    loading={loading}
                    disabled={disabled || (!customize && !state.editable)}
                    reset={state.default !== null && state.value !== state.default}
                    onChange={(event, value) => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ignore_filtering = { ...state, value };
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ignore_filtering = { ...state, value: state.default };
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state =>
                  state.values?.next?.submission_profiles?.[profile]?.generate_alert || {
                    value: null,
                    default: null,
                    editable: false
                  }
                }
                children={state => (
                  <BooleanListInput
                    id="settings:submissions.generate_alert"
                    primary={t('settings:submissions.generate_alert')}
                    secondary={t('settings:submissions.generate_alert_desc')}
                    value={state.value}
                    loading={loading}
                    disabled={disabled || (!customize && !state.editable)}
                    reset={state.default !== null && state.value !== state.default}
                    onChange={(event, value) => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].generate_alert = { ...state, value };
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].generate_alert = { ...state, value: state.default };
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state =>
                  state.values?.next?.submission_profiles?.[profile]?.ignore_cache || {
                    value: null,
                    default: null,
                    editable: false
                  }
                }
                children={state => (
                  <BooleanListInput
                    id="settings:submissions.result_caching"
                    primary={t('settings:submissions.result_caching')}
                    secondary={t('settings:submissions.result_caching_desc')}
                    value={state.value}
                    loading={loading}
                    disabled={disabled || (!customize && !state.editable)}
                    reset={state.default !== null && state.value !== state.default}
                    onChange={(event, value) => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ignore_cache = { ...state, value };
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.next.submission_profiles[profile].ignore_cache = { ...state, value: state.default };
                        return s;
                      });
                    }}
                  />
                )}
              />
            </List>
          </div>
        );
      }}
    />
  );
};
