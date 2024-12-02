import { List, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/contexts/form';
import { InputContainer, InputHeader, InputList } from 'components/routes/settings/inputs/Inputs';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { useTranslation } from 'react-i18next';

type Props = {
  customize: boolean;
  disabled: boolean;
  hidden: boolean;
  loading: boolean;
};

export const InterfaceSection = ({ customize = false, disabled = false, hidden = false, loading = false }: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <InputContainer hidden={hidden}>
      <InputHeader
        primary={{ children: t('interface'), id: 'interface' }}
        secondary={{ children: t('interface.description') }}
      />

      <InputList>
        <form.Field
          name="next.preferred_submission_profile"
          children={({ state, handleBlur, handleChange }) => (
            <SelectInput
              primary={t('settings:submissions.submission_profile')}
              secondary={t('settings:submissions.submission_profile_desc')}
              value={state.value}
              loading={loading}
              disabled={disabled}
              options={Object.keys(configuration?.submission?.profiles || {}).map(profileValue => ({
                value: profileValue,
                label: t(`profile.${profileValue}`)
              }))}
              onChange={e => handleChange(e.target.value as string)}
              onBlur={handleBlur}
            />
          )}
        />

        <form.Field
          name="next.submission_view"
          children={({ state, handleBlur, handleChange }) => (
            <SelectInput
              primary={t('interface.view')}
              secondary={t('interface.view_desc')}
              value={state.value}
              loading={loading}
              disabled={disabled}
              options={[
                { value: 'report', label: t('interface.view_report') },
                { value: 'details', label: t('interface.view_details') }
              ]}
              onChange={e => handleChange(e.target.value as 'details' | 'report')}
              onBlur={handleBlur}
            />
          )}
        />

        <form.Field
          name="next.download_encoding"
          children={({ state, handleBlur, handleChange }) => (
            <SelectInput
              primary={t('interface.encoding')}
              secondary={t('interface.encoding_desc')}
              value={state.value}
              loading={loading}
              disabled={disabled}
              options={[
                ...(configuration.ui.allow_raw_downloads && [{ value: 'raw', label: t('interface.encoding_raw') }]),
                { value: 'cart', label: t('interface.encoding_cart') },
                ...(configuration.ui.allow_zip_downloads && [{ value: 'zip', label: t('interface.encoding_zip') }])
              ]}
              onChange={e => handleChange(e.target.value as 'raw' | 'cart' | 'zip')}
              onBlur={handleBlur}
            />
          )}
        />

        <form.Field
          name="next.expand_min_score"
          children={({ state, handleBlur, handleChange }) => (
            <SelectInput
              primary={t('interface.score')}
              secondary={t('interface.score_desc')}
              value={state.value}
              loading={loading}
              disabled={disabled}
              options={[
                { value: '-1000000', label: t('interface.score_-1000000') },
                { value: '0', label: t('interface.score_0') },
                { value: '100', label: t('interface.score_100') },
                { value: '500', label: t('interface.score_500') },
                { value: '2000', label: t('interface.score_2000') },
                { value: '100000000', label: t('interface.score_100000000') }
              ]}
              onChange={e => handleChange(e.target.value as number)}
              onBlur={handleBlur}
            />
          )}
        />
      </InputList>
    </InputContainer>
  );

  return (
    <form.Subscribe
      selector={state => [state.values.state.loading, state.values.state.disabled, state.values.state.tab]}
      children={([loading, disabled, tab]) => {
        return !tab || tab !== 'interface' ? null : (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            <Typography id="interface" className="Anchor" variant="h6">
              {t('interface')}
            </Typography>
            <List
              disablePadding
              sx={{
                bgcolor: 'background.paper',
                '&>:not(:last-child)': {
                  borderBottom: `thin solid ${theme.palette.divider}`
                }
              }}
            >
              <form.Field
                name="next.preferred_submission_profile"
                children={({ state, handleBlur, handleChange }) => (
                  <SelectInput
                    primary={t('settings:submissions.submission_profile')}
                    secondary={t('settings:submissions.submission_profile_desc')}
                    value={state.value}
                    loading={loading as boolean}
                    disabled={disabled as boolean}
                    options={Object.keys(configuration?.submission?.profiles || {}).map(profileValue => ({
                      value: profileValue,
                      label: t(`profile.${profileValue}`)
                    }))}
                    onChange={e => handleChange(e.target.value as string)}
                    onBlur={handleBlur}
                  />
                )}
              />

              <form.Field
                name="next.submission_view"
                children={({ state, handleBlur, handleChange }) => (
                  <SelectInput
                    primary={t('interface.view')}
                    secondary={t('interface.view_desc')}
                    value={state.value}
                    loading={loading as boolean}
                    disabled={disabled as boolean}
                    options={[
                      { value: 'report', label: t('interface.view_report') },
                      { value: 'details', label: t('interface.view_details') }
                    ]}
                    onChange={e => handleChange(e.target.value as 'details' | 'report')}
                    onBlur={handleBlur}
                  />
                )}
              />

              <form.Field
                name="next.download_encoding"
                children={({ state, handleBlur, handleChange }) => (
                  <SelectInput
                    primary={t('interface.encoding')}
                    secondary={t('interface.encoding_desc')}
                    value={state.value}
                    loading={loading as boolean}
                    disabled={disabled as boolean}
                    options={[
                      ...(configuration.ui.allow_raw_downloads && [
                        { value: 'raw', label: t('interface.encoding_raw') }
                      ]),
                      { value: 'cart', label: t('interface.encoding_cart') },
                      ...(configuration.ui.allow_zip_downloads && [
                        { value: 'zip', label: t('interface.encoding_zip') }
                      ])
                    ]}
                    onChange={e => handleChange(e.target.value as 'raw' | 'cart' | 'zip')}
                    onBlur={handleBlur}
                  />
                )}
              />

              <form.Field
                name="next.expand_min_score"
                children={({ state, handleBlur, handleChange }) => (
                  <SelectInput
                    primary={t('interface.score')}
                    secondary={t('interface.score_desc')}
                    value={state.value}
                    loading={loading as boolean}
                    disabled={disabled as boolean}
                    options={[
                      { value: '-1000000', label: t('interface.score_-1000000') },
                      { value: '0', label: t('interface.score_0') },
                      { value: '100', label: t('interface.score_100') },
                      { value: '500', label: t('interface.score_500') },
                      { value: '2000', label: t('interface.score_2000') },
                      { value: '100000000', label: t('interface.score_100000000') }
                    ]}
                    onChange={e => handleChange(e.target.value as number)}
                    onBlur={handleBlur}
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
