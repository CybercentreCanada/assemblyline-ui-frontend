import { Delete } from '@mui/icons-material';
import { Button, FormControlLabel, Switch, Typography, useTheme, type Theme } from '@mui/material';
import useALContext from 'core/config/useALContext';
import { FeatureFlagged } from 'core/feature-flag/FeatureFlagged';
import { useIsFeatureEnabled, useUpdateFeatureFlag } from 'core/feature-flag/feature-flag.hooks';
import { EMPTY_FEATURE_FLAG_STATE, type FeatureFlagStore } from 'core/feature-flag/feature-flag.models';
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
const DELETE_ICON = <Delete />;

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
  return <Typography color={enabled ? 'success' : 'error'}> Foo </Typography>;
};`;

const COMPONENT_EXAMPLE = `import { PREVIEW_FLAG } from 'app/core.feature-flag';
import { FeatureFlagged } from 'core/feature-flag';

<FeatureFlagged flag={PREVIEW_FLAG}>
  <PreviewContent />
</FeatureFlagged>`;

const codeStyle = (theme: Theme): CSSProperties => ({
  margin: 0,
  padding: theme.spacing(2),
  background: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  overflowX: 'auto',
  maxWidth: '100%',
  fontSize: theme.typography.body2.fontSize,
  lineHeight: 1.6,
  tabSize: 2
});

const borderStyle = (theme: Theme): CSSProperties => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  minWidth: 0
});

/* Component Preview Content */
const ComponentPreviewContent = memo(() => {
  const { t } = useTranslation(['developmentFeatureFlags']);

  // Log on mount + unmount to showcase feature flag's power
  useEffect(() => {
    /* eslint-disable no-console */
    console.log('Preview content component mounted');
    return () => console.log('Preview content component unmounted');
    /* eslint-enable no-console */
  }, []);

  return <Typography>{t('demo.component.content')}</Typography>;
});

ComponentPreviewContent.displayName = 'ComponentPreviewContent';

/* Feature Flag Example */
const FeatureFlagExample = memo(() => {
  const { t } = useTranslation(['developmentFeatureFlags']);
  const theme = useTheme();
  const codeStyles = useMemo(() => codeStyle(theme), [theme]);
  const borderStyles = useMemo(() => borderStyle(theme), [theme]);
  const enabled = useIsFeatureEnabled(DEMO_FLAG);
  const updateFlag = useUpdateFeatureFlag();
  const setStore = useAppSetFeatureFlagStore();

  // Remove local storage key on component unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem(DEMO_KEY);
    };
  }, []);

  const handleChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => updateFlag(DEMO_FLAG, checked),
    [updateFlag]
  );
  const handleClear = useCallback(() => setStore(EMPTY_FEATURE_FLAG_STATE), [setStore]);

  return (
    <section>
      <Typography variant="h5" component="h2">
        {t('demo.title')}
      </Typography>
      <Typography gutterBottom>{t('demo.title.sub')}</Typography>

      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(2),
            margin: theme.spacing(2)
          }}
        >
          <FormControlLabel control={<Switch checked={enabled} onChange={handleChange} />} label={t('demo.toggle')} />

          <Button startIcon={DELETE_ICON} onClick={handleClear}>
            {t('demo.clear')}
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: theme.spacing(2)
          }}
        >
          {/* useHook example */}
          <div style={borderStyles}>
            <Typography variant="h6" component="h3">
              {t('demo.hook.title')}
            </Typography>
            <Typography gutterBottom>{t('demo.hook.description')}</Typography>

            <section>
              <pre style={codeStyles}>
                <code>{HOOK_EXAMPLE}</code>
              </pre>
            </section>

            <section>
              <Typography sx={{ mt: 2 }}>{t('demo.value', { value: enabled.toString() })}</Typography>

              <div style={borderStyles}>
                <Typography color={enabled ? 'success' : 'error'}>{t('demo.hook.content')}</Typography>
              </div>
            </section>
          </div>

          {/* FeatureFlagged component example */}
          <div style={borderStyles}>
            <Typography variant="h6" component="h3">
              {t('demo.component.title')}
            </Typography>
            <Typography gutterBottom>{t('demo.component.description')}</Typography>

            <section>
              <pre style={codeStyles}>
                <code>{COMPONENT_EXAMPLE}</code>
              </pre>
            </section>

            <section>
              <Typography sx={{ mt: 2 }}>
                {enabled ? t('demo.component.enabled') : t('demo.component.disabled')}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                {t('demo.component.consoleHint')}
              </Typography>

              <div style={borderStyles}>
                <FeatureFlagged flag={DEMO_FLAG}>
                  <ComponentPreviewContent />
                </FeatureFlagged>
              </div>
            </section>
          </div>
        </div>
      </section>
    </section>
  );
});

FeatureFlagExample.displayName = 'FeatureFlagExample';

const DevelopmentFeatureFlags = memo(() => {
  const { t } = useTranslation(['developmentFeatureFlags']);
  const theme = useTheme();
  const codeStyles = useMemo(() => codeStyle(theme), [theme]);
  const borderStyles = useMemo(() => borderStyle(theme), [theme]);
  const { user: currentUser, configuration } = useALContext();

  // Remove local storage key on tab close/refresh
  useEffect(() => {
    const handleTabClose = () => {
      localStorage.removeItem(DEMO_KEY);
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
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
          <div style={borderStyles}>
            <Typography variant="h6" component="h3">
              {t('start.declare.title')}
            </Typography>
            <Typography gutterBottom>{t('start.declare.subtitle')}</Typography>

            <pre style={codeStyles}>
              <code>{DECLARE_EXAMPLE}</code>
            </pre>
          </div>

          <div style={borderStyles}>
            <Typography variant="h6" component="h3">
              {t('start.register.title')}
            </Typography>
            <Typography gutterBottom>{t('start.register.subtitle')}</Typography>

            <pre style={codeStyles}>
              <code>{REGISTER_EXAMPLE}</code>
            </pre>
          </div>
        </div>

        <section>
          <AppFeatureFlagStoreProvider data={DEMO_STATE}>
            <AppFeatureFlagProvider storageKey={DEMO_KEY} defaultState={DEMO_STATE}>
              <FeatureFlagExample />
            </AppFeatureFlagProvider>
          </AppFeatureFlagStoreProvider>
        </section>

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
      </div>
    </PageFullSize>
  );
});

DevelopmentFeatureFlags.displayName = 'DevelopmentFeatureFlags';

export default DevelopmentFeatureFlags;
