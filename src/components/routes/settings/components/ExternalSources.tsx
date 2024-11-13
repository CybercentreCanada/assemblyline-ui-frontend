import { List, ListItem, ListItemText, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { Submission } from 'components/models/base/config';
import { useForm } from 'components/routes/settings/contexts/form';
import { BooleanInput } from 'components/routes/settings/inputs/BooleanInput';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ExternalSourcesSection = () => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  const fileSources = useMemo<string[]>(
    () =>
      Object.values(configuration?.submission?.file_sources || {})
        .flatMap(file => file?.sources)
        .filter((value, index, array) => value && array.indexOf(value) === index)
        .sort(),
    [configuration]
  );

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

        return fileSources.length > 0 ? (
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
              <ListItem id="default_external_sources" alignItems="flex-start">
                <ListItemText
                  primary={t('submissions.default_external_sources')}
                  secondary={t('submissions.default_external_sources_desc')}
                  primaryTypographyProps={{ variant: 'h6' }}
                />
              </ListItem>

              {fileSources.map((source, i) => (
                <form.Subscribe
                  key={`${source}-${i}`}
                  selector={state => state.values.next.default_external_sources.includes(source)}
                  children={value => (
                    <BooleanInput
                      primary={t('interface.view')}
                      secondary={t('interface.view_desc')}
                      value={value}
                      loading={loading}
                      disabled={disabled}
                      onClick={() => {
                        form.setStore(s => {
                          if (value) s.next.default_external_sources.filter(item => item !== source);
                          else s.next.default_external_sources.push(source);
                          return s;
                        });
                      }}
                    />
                  )}
                />
              ))}
            </List>
          </>
        ) : null;
      }}
    />
  );
};
