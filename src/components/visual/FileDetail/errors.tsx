import ErrorCard from 'components/visual/ErrorCard';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ErrorSectionProps = {
  errors: any;
  nocollapse?: boolean;
};

const WrappedErrorSection: React.FC<ErrorSectionProps> = ({ errors, nocollapse = false }) => {
  const { t } = useTranslation(['fileDetail']);

  return errors && errors.length !== 0 ? (
    <SectionContainer title={t('errors')} nocollapse={nocollapse}>
      {errors.map((error, i) => (
        <ErrorCard key={i} error={error} />
      ))}
    </SectionContainer>
  ) : null;
};

const ErrorSection = React.memo(WrappedErrorSection);
export default ErrorSection;
