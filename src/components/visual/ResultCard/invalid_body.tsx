import { Alert } from '@material-ui/lab';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';

const WrappedInvalidBody = () => {
  const { t } = useTranslation(['fileDetail']);
  return (
    <Alert style={{ padding: '2rem' }} variant="standard" severity="error">
      {t('invalid_section')}
    </Alert>
  );
};

export const InvalidBody = React.memo(WrappedInvalidBody);
