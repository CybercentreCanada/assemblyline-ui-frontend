import type { Error } from 'components/models/base/error';
import ErrorCard from 'components/visual/ErrorCard';
import SectionContainer from 'components/visual/SectionContainer';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ErrorSectionProps = {
  errors: Error[];
  nocollapse?: boolean;
};

const WrappedErrorSection: React.FC<ErrorSectionProps> = ({ errors = [], nocollapse = false }) => {
  const { t } = useTranslation(['fileDetail']);

  const parsedWarnings = useMemo<Error[]>(() => errors?.filter(e => e?.severity === 'warning'), [errors]);

  const parsedErrors = useMemo<Error[]>(() => errors?.filter(error => error?.severity !== 'warning'), [errors]);

  return (
    <>
      {!parsedErrors?.length ? null : (
        <SectionContainer title={t('errors')} nocollapse={nocollapse}>
          {parsedErrors.map((error, i) => (
            <ErrorCard key={i} error={error} />
          ))}
        </SectionContainer>
      )}

      {!parsedWarnings?.length ? null : (
        <SectionContainer title={t('warnings')} nocollapse={nocollapse}>
          {parsedWarnings.map((error, i) => (
            <ErrorCard key={i} error={error} />
          ))}
        </SectionContainer>
      )}
    </>
  );
};

const ErrorSection = React.memo(WrappedErrorSection);
export default ErrorSection;
