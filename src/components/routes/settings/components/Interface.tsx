import { List, ListItem, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Submission } from 'components/models/base/config';
import { useForm } from 'components/routes/settings/contexts/form';
import { SelectInput } from 'components/routes/settings/inputs/SelectInput';
import { useTranslation } from 'react-i18next';

export const InterfaceSection = () => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.disabled,
        state.values.state.profile,
        state.values.state.hide
      ]}
      children={props => {
        const loading = props[0] as boolean;
        const disabled = props[1] as boolean;
        const profile = props[2] as keyof Submission['profiles'];
        const hide = props[3] as boolean;

        return (
          <>
            <List
              disablePadding
              sx={{
                bgcolor: 'background.paper',
                '&>:not(:last-child)': {
                  borderBottom: `thin solid ${theme.palette.divider}`
                }
              }}
            >
              <ListItem id="interface" className="Anchor" alignItems="flex-start">
                <Typography variant="h6">{t('interface')}</Typography>
              </ListItem>

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
            </List>
          </>
        );
      }}
    />
  );
};
