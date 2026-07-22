import { Paper, Typography, useTheme } from '@mui/material';
import { useAppSearchParams } from 'core/routes';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/pages/PageCenter';

//*****************************************************************************************
// Not Found Page
//*****************************************************************************************

export const NotFoundPage = memo(() => {
  const { t } = useTranslation(['error404']);
  const theme = useTheme();

  const search = useAppSearchParams<'/not-found'>();

  const valuesPreview = useMemo(() => {
    if (search?.values == null) return t('values.none');

    try {
      return JSON.stringify(search?.values, null, 2);
    } catch {
      return t('values.unserializable');
    }
  }, [search, t]);

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), paddingBottom: theme.spacing(6) }}>
        <Typography variant="h1">{t('title')}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('description')}</Typography>
      </div>

      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: theme.spacing(3),
          padding: theme.spacing(2)
        }}
      >
        <Typography
          data-testid="not-found-values"
          variant="inherit"
          component="pre"
          sx={{
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {valuesPreview}
        </Typography>
      </Paper>
    </PageCenter>
  );
});

NotFoundPage.displayName = 'NotFoundPage';
