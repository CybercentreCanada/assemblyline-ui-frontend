import { Typography, useTheme } from '@mui/material';
import { useFeatureFlags, useUpdateFeatureFlag, type FeatureFlag, type FeatureFlagDefinition } from 'core/feature-flag';
import useMySnackbar from 'core/snackbar/snackbar.hooks';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BooleanListInput } from 'ui/list-inputs/BooleanListInput';
import { List } from 'ui/list/List';
import { ListHeader } from 'ui/list/ListHeader';

type FeatureFlagDefinitionState = FeatureFlagDefinition & FeatureFlag;

export type ManageFeatureFlagProps = {
  definitions: FeatureFlagDefinition[];
};

export const ManageFeatureFlags = memo(({ definitions }: ManageFeatureFlagProps) => {
  const { t } = useTranslation(['featureFlags', 'translation']);
  const theme = useTheme();
  const updateFeatureFlag = useUpdateFeatureFlag();
  const { showSuccessMessage } = useMySnackbar();

  const storeFlags = useFeatureFlags();

  const updateFlag = useCallback(
    (flag: string, enabled: boolean) => {
      updateFeatureFlag(flag, enabled);
      showSuccessMessage(t('flag-updated'));
    },
    [showSuccessMessage, updateFeatureFlag, t]
  );

  const flagDefs: FeatureFlagDefinitionState[] = definitions
    .toSorted((a, b) => a.flag.localeCompare(b.flag))
    .map(definition => {
      const enabled = storeFlags.find(flag => flag.flag === definition.flag)?.enabled ?? false;
      return { ...definition, enabled };
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
      <ListHeader
        id="feature-flags"
        primary={t('title')}
        secondary={t('title.sub')}
        slotProps={{ primary: { className: 'Anchor', variant: 'h6' } }}
      />
      {flagDefs.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2">{t('no-flags')}</Typography>
        </div>
      ) : (
        <List>
          {flagDefs.map(({ flag, descriptionKey, state, enabled }, index) => (
            <BooleanListInput
              divider={index < flagDefs.length - 1}
              key={flag}
              primary={
                <span style={{ display: 'flex', alignItems: 'baseline', gap: theme.spacing(1) }}>
                  <Typography component="span" variant="body1">
                    {flag}
                  </Typography>

                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: state === 'alpha' ? theme.palette.warning.main : theme.palette.info.main
                    }}
                  >
                    ({t(`state.${state}`)})
                  </Typography>
                </span>
              }
              secondary={t(descriptionKey, { ns: 'translation' })}
              value={enabled}
              onChange={(_, checked) => updateFlag(flag, checked)}
            />
          ))}
        </List>
      )}
    </div>
  );
});

ManageFeatureFlags.displayName = 'ManageFeatureFlags';
