import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { Card, CardHeader, Grid, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { createAppRoute } from 'core/routes';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Classification from 'ui/Classification';
import CustomChip from 'ui/CustomChip';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageFullWidth } from 'ui/pages/PageFullWidth';

function ServiceCard({ service }) {
  const { t } = useTranslation(['helpServices']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const minCardHeight = '240px';
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);

  return (
    <Card
      style={{
        minHeight: minCardHeight,
        backgroundColor: service.enabled ? null : isDark ? '#ff000017' : '#FFE4E4',
        border: `solid 1px ${
          service.enabled ? theme.palette.divider : isDark ? theme.palette.error.light : theme.palette.error.dark
        }`
      }}
    >
      <CardHeader
        title={service.name}
        subheader={service.version}
        action={
          service.enabled ? null : (
            <div style={{ padding: sp2 }}>
              <CustomChip type="rounded" variant="outlined" size="small" color="error" label={t('disabled')} />
            </div>
          )
        }
        style={{ padding: theme.spacing(1) }}
      />
      <div style={{ padding: sp1 }}>
        <div style={{ minHeight: '110px', whiteSpace: 'pre-wrap', paddingBottom: theme.spacing(1) }}>
          {service.description}
        </div>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <label style={{ fontWeight: 500 }}>{t('accepts')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.accepts}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <label style={{ fontWeight: 500 }}>{t('rejects')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.rejects}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <label style={{ fontWeight: 500 }}>{t('category')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.category}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <label style={{ fontWeight: 500 }}>{t('stage')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.stage}
            </Typography>
          </Grid>
        </Grid>
      </div>
      <div style={{ marginBottom: '-2px' }}>
        <Classification size="tiny" format="long" c12n={service ? service.classification : null} />
      </div>
    </Card>
  );
}

export const HelpServicesPage = memo(() => {
  const { apiCall } = useMyAPI();
  const { t } = useTranslation(['helpServices']);
  const theme = useTheme();
  const [services, setServices] = useState(null);
  const minCardHeight = '240px';

  useEffect(() => {
    // Load all services on start
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: api_data => {
        setServices(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageFullWidth margin={4}>
      <PageHeader
        primary={t('title')}
        secondary={() => `${services.length} ${t('count')}`}
        secondaryLoading={!services}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(4) } }
        }}
      />

      {services ? (
        <Grid container spacing={2}>
          {services.map((s, i) => (
            <Grid key={i} size={{ xs: 12, md: 6, xl: 4 }}>
              <ServiceCard service={s} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, md: 6, xl: 4 }}>
              <Skeleton variant="rectangular" style={{ height: minCardHeight }} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageFullWidth>
  );
});

export const HelpServicesRoute = createAppRoute({
  component: HelpServicesPage,

  path: '/help/services',

  ancestor: '/help',
  shortname: () => ({ i18nKey: 'drawer.help.services', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.help.services', ns: 'app' }),
  shorticon: () => <AccountTreeOutlinedIcon />,
  fullicon: () => <AccountTreeOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
