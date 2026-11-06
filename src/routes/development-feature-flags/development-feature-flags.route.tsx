import { RestartAlt } from '@mui/icons-material';
import { Button, FormControlLabel, Switch, Typography, useTheme, type Theme } from '@mui/material';
import useALContext from 'core/config/useALContext';
import { FeatureFlagged } from 'core/feature-flag/FeatureFlagged';
import { useIsFeatureEnabled, useUpdateFeatureFlag } from 'core/feature-flag/feature-flag.hooks';
import type { FeatureFlagStore } from 'core/feature-flag/feature-flag.models';
import {
  AppFeatureFlagProvider,
  AppFeatureFlagStoreProvider,
  useAppSetFeatureFlagStore
} from 'core/feature-flag/feature-flag.providers';
import PageFullSize from 'core/template/branding/AppPageCenter';
import type { ChangeEvent, CSSProperties } from 'react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { PageHeader } from 'ui/layouts/PageHeader';

const DEMO_KEY = 'assemblyline.development.feature-flags.preview';
const DEMO_FLAG = 'demo.flag';
const DEMO_STATE: FeatureFlagStore = { flags: [{ flag: DEMO_FLAG, enabled: false }] };
const RESET_ICON = <RestartAlt />;

const DECLARE_EXAMPLE = `// app/core.feature-flag.ts
export const PREVIEW_FLAG: FeatureFlagType = 'preview';
export const PREVIEW_FLAG_DEF: FeatureFlagDefinition = {
  flag: PREVIEW_FLAG,
  descriptionKey: 'featureFlags.preview',
  state: 'alpha'
};`;

const REGISTER_EXAMPLE = `// app/core.feature-flag.ts
export const DEFAULT_FEATURE_FLAG_STATE: FeatureFlagStore = {
  flags: [{ flag: PREVIEW_FLAG, enabled: false }]
};`;

const HOOK_EXAMPLE = `import { PREVIEW_FLAG } from 'app/core.feature-flag';
import { useIsFeatureEnabled } from 'core/feature-flag';

const Preview = () => {
  const enabled = useIsFeatureEnabled(PREVIEW_FLAG);
  return enabled ? <PreviewContent /> : null;
};`;

const COMPONENT_EXAMPLE = `import { PREVIEW_FLAG } from 'app/core.feature-flag';
import { FeatureFlagged } from 'core/feature-flag';

<FeatureFlagged flag={PREVIEW_FLAG}>
  <PreviewContent />
</FeatureFlagged>`;

const codeStyle = (theme: Theme) =>
  useMemo<CSSProperties>(
    () => ({
      margin: 0,
      padding: theme.spacing(2),
      background: theme.palette.action.hover,
      borderRadius: theme.shape.borderRadius,
      overflowX: 'auto',
      maxWidth: '100%',
      fontSize: theme.typography.body2.fontSize,
      lineHeight: 1.6,
      tabSize: 2
    }),
    [theme]
  );

const FeatureFlagExample = memo(() => {
  const { t } = useTranslation(['developmentFeatureFlags']);
  const theme = useTheme();
  const enabled = useIsFeatureEnabled(DEMO_FLAG);
  const updateFlag = useUpdateFeatureFlag();
  const setStore = useAppSetFeatureFlagStore();

  const handleChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => updateFlag(DEMO_FLAG, checked),
    [updateFlag]
  );
  const handleReset = useCallback(() => setStore(DEMO_STATE), [setStore]);

  const previewStyle = useMemo<CSSProperties>(
    () => ({
      padding: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      minWidth: 0
    }),
    [theme]
  );

  return (
    <section>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('demo.title')}
      </Typography>
      <Typography>{t('demo.description')}</Typography>

      <section>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing(2) }}>
          <FormControlLabel control={<Switch checked={enabled} onChange={handleChange} />} label={t('demo.toggle')} />

          <Button startIcon={RESET_ICON} onClick={handleReset} disabled={!enabled}>
            {t('demo.reset')}
          </Button>
        </div>
      </section>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: theme.spacing(2)
        }}
      >
        {/* useHook example */}
        <div style={previewStyle}>
          <Typography variant="h6" component="h3">
            {t('demo.hook.title')}
          </Typography>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('hook.title')}
            </Typography>
            <Typography>{t('hook.description')}</Typography>
            <pre style={codeStyle(theme)}>
              <code>{HOOK_EXAMPLE}</code>
            </pre>
            <Typography sx={{ mt: 2 }}>{t('hook.unknown')}</Typography>
          </section>

          <section>
            <Typography>{enabled ? t('demo.enabled') : t('demo.disabled')}</Typography>
            {enabled && <Typography>{t('demo.hook.content')}</Typography>}
          </section>
        </div>

        {/* FeatureFlagged component example */}
        <div style={previewStyle}>
          <Typography variant="h6" component="h3">
            {t('demo.component.title')}
          </Typography>

          <section>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('component.title')}
            </Typography>
            <Typography>{t('component.description')}</Typography>
            <pre style={codeStyle(theme)}>
              <code>{COMPONENT_EXAMPLE}</code>
            </pre>
            <Typography sx={{ mt: 2 }}>{t('component.unknown')}</Typography>
          </section>

          <section>
            <Typography>{enabled ? t('demo.enabled') : t('demo.disabled')}</Typography>

            <FeatureFlagged flag={DEMO_FLAG}>
              <Typography>{t('demo.component.content')}</Typography>
            </FeatureFlagged>
          </section>
        </div>
      </div>
    </section>
  );
});

FeatureFlagExample.displayName = 'FeatureFlagExamples';

const DevelopmentFeatureFlags = memo(() => {
  const { t } = useTranslation(['developmentFeatureFlags']);
  const theme = useTheme();
  const { user: currentUser, configuration } = useALContext();

  useEffect(() => {
    return () => {
      // Remove local storage key on component unmount
      localStorage.removeItem(DEMO_KEY);
    };
  }, []);

  return !currentUser.is_admin || !['development', 'staging'].includes(configuration.system.type) ? (
    <Navigate to="/forbidden" replace />
  ) : (
    <PageFullSize margin={4}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: theme.spacing(12),
          gap: theme.spacing(4)
        }}
      >
        <section>
          <PageHeader primary={t('title')} />
          <Typography>{t('title.sub')}</Typography>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: theme.spacing(4)
          }}
        >
          <section>
            <Typography variant="h6" component="h3">
              {t('start.declare.title')}
            </Typography>
            <Typography gutterBottom>{t('start.declare.subtitle')}</Typography>

            <pre style={codeStyle(theme)}>
              <code>{DECLARE_EXAMPLE}</code>
            </pre>
          </section>

          <section>
            <Typography variant="h6" component="h3">
              {t('start.register.title')}
            </Typography>
            <Typography gutterBottom>{t('start.registration.subtitle')}</Typography>

            <pre style={codeStyle(theme)}>
              <code>{REGISTER_EXAMPLE}</code>
            </pre>
          </section>
        </div>

        <section>
          <Typography variant="h5" component="h2">
            {t('definitions.title')}
          </Typography>
          <Typography gutterBottom>{t('definitions.subtitle')}</Typography>

          <ul>
            <li>
              <code>flag:</code> {t('definitions.flag')}
            </li>
            <li>
              <code>descriptionKey:</code> {t('definitions.descriptionKey')}
            </li>
            <li>
              <code>state:</code> {t('definitions.state')}
            </li>
          </ul>
        </section>

        <section>
          <Typography variant="h5" component="h2" gutterBottom>
            {t('security.title')}
          </Typography>
          <Typography>{t('security.description')}</Typography>
        </section>

        <section>
          <AppFeatureFlagStoreProvider data={DEMO_STATE}>
            <AppFeatureFlagProvider storageKey={DEMO_KEY} defaultState={DEMO_STATE}>
              <FeatureFlagExample />
            </AppFeatureFlagProvider>
          </AppFeatureFlagStoreProvider>
        </section>
      </div>
    </PageFullSize>
  );
});

DevelopmentFeatureFlags.displayName = 'DevelopmentFeatureFlags';

export default DevelopmentFeatureFlags;
