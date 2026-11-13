import { useTheme } from '@mui/material';
import PageFullSize from 'core/template/branding/AppPageCenter';
import { useAppUser } from 'core/template/components/app/hooks';
import type { CustomUser } from 'models/api/user';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { PageHeader } from 'ui/layouts/PageHeader';

const AdminFeatureFlags = () => {
  const { t } = useTranslation(['adminFeatureFlags']);
  const theme = useTheme();
  const { user: currentUser } = useAppUser<CustomUser>();

  return currentUser.is_admin ? (
    <PageFullSize margin={4}>
      <PageHeader primary={t('title')} secondary={t('title.sub')} />
    </PageFullSize>
  ) : (
    <Navigate to="/forbidden" replace />
  );
};

export default AdminFeatureFlags;
