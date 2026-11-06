import { Grid, Paper, Typography, useTheme } from '@mui/material';
import useALContext from 'core/config/useALContext';
import PageFullSize from 'core/template/branding/AppPageCenter';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { PageHeader } from 'ui/layouts/PageHeader';

const DevelopmentFeatureFlags = memo(() => {
  const { t } = useTranslation(['developmentFeatureFlags']);
  const theme = useTheme();
  const { user: currentUser, configuration } = useALContext();

  return !currentUser.is_admin || !['development', 'staging'].includes(configuration.system.type) ? (
    <Navigate to="/forbidden" replace />
  ) : (
    <PageFullSize margin={4}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
        <PageHeader primary={t('title')} />

        <Grid container component={Paper}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ padding: theme.spacing(1) }}>
            <Typography variant="body1">{t('request')}</Typography>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: theme.spacing(1),
                rowGap: theme.spacing(0.25)
              }}
            >
              test
            </div>
          </Grid>
        </Grid>
      </div>
    </PageFullSize>
  );
});

export default DevelopmentFeatureFlags;
