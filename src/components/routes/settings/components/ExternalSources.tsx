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

  const fileSources = useMemo<string[]>(() => {
    if (!configuration?.submission?.file_sources) return [];

    const sourcesSet = new Set<string>();
    Object.values(configuration.submission.file_sources).forEach(file => {
      file?.sources?.forEach(src => {
        if (src) sourcesSet.add(src);
      });
    });

    return Array.from(sourcesSet).sort((a, b) => a.localeCompare(b));
  }, [configuration]);

  if (fileSources.length === 0) return null;

  return (
    <form.Subscribe selector={state => [state.values.state.disabled, state.values.state.loading] as const}>
      {([disabled, loading]) => (
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
              '& > :not(:last-child)': {
                borderBottom: `thin solid ${theme.palette.divider}`
              }
            }}
          >
            {fileSources.map(source => {
              if (!source) return null;

              return (
                <form.Subscribe
                  key={source}
                  selector={state => [state.values.settings.default_external_sources.value.includes(source)] as const}
                >
                  {([value]) => (
                    <BooleanListInput
                      primary={source}
                      value={value}
                      loading={loading}
                      disabled={disabled}
                      overflowHidden
                      onChange={(_, checked) => {
                        form.setFieldValue('settings', settings => {
                          if (!settings.default_external_sources?.value) {
                            settings.default_external_sources.value = [];
                          }

                          const current = settings.default_external_sources.value;

                          settings.default_external_sources.value = checked
                            ? Array.from(new Set([...current, source]))
                            : current.filter(item => item !== source);

                          return settings;
                        });
                      }}
                    />
                  )}
                </form.Subscribe>
              );
            })}
          </List>
        </div>
      )}
    </form.Subscribe>
  );
});

ExternalSourcesSection.displayName = 'ExternalSourcesSection';
