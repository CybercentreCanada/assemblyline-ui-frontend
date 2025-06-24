import { List, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/settings.form';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ExternalSourcesSection = React.memo(() => {
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

  return fileSources.length === 0 ? null : (
    <form.Subscribe
      selector={state => [state.values.state.disabled, state.values.state.loading] as const}
      children={([disabled, loading]) => (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
          <PageSection
            id="default_external_sources"
            primary={t('submissions.default_external_sources')}
            secondary={t('submissions.default_external_sources_desc')}
            primaryProps={{ variant: 'h6' }}
            subheader
            anchor
          />
          <List
            disablePadding
            sx={{
              bgcolor: 'background.paper',
              '&>:not(:last-child)': {
                borderBottom: `thin solid ${theme.palette.divider}`
              }
            }}
          >
            {fileSources.map((source, i) => (
              <form.Subscribe
                key={`${source}-${i}`}
                selector={state => [state.values.settings.default_external_sources.value.includes(source)] as const}
                children={([value]) => (
                  <BooleanListInput
                    primary={source}
                    value={value}
                    loading={loading}
                    disabled={disabled}
                    onChange={(e, v) => {
                      form.setFieldValue('settings', s => {
                        if (v) s.default_external_sources.value.push(source);
                        else
                          s.default_external_sources.value = s.default_external_sources.value.filter(
                            item => item !== source
                          );

                        return s;
                      });
                    }}
                  />
                )}
              />
            ))}
          </List>
        </div>
      )}
    />
  );
});
