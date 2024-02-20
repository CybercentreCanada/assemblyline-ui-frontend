import { Skeleton } from '@mui/material';
import useSafeResults from 'components/hooks/useSafeResults';
import ResultCard, { AlternateResult } from 'components/visual/ResultCard';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ResultSectionProps = {
  results: any;
  sid: string;
  alternates?: {
    [serviceName: string]: AlternateResult[];
  };
  force?: boolean;
  nocollapse?: boolean;
};

const WrappedResultSection: React.FC<ResultSectionProps> = ({
  results,
  sid,
  alternates,
  force = false,
  nocollapse = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const { showSafeResults } = useSafeResults();

  return !results || results.some(i => i.result.score >= 0) || (results.length > 0 && (showSafeResults || force)) ? (
    <SectionContainer title={t('results')} nocollapse={nocollapse}>
      {results
        ? results.map((result, i) => (
            <ResultCard
              key={i}
              result={result}
              sid={sid}
              alternates={alternates ? alternates[result.response.service_name] : null}
              force={force}
            />
          ))
        : [...Array(2)].map((_, i) => (
            <Skeleton
              variant="rectangular"
              key={i}
              style={{ height: '12rem', marginBottom: '8px', borderRadius: '4px' }}
            />
          ))}
    </SectionContainer>
  ) : null;
};

const ResultSection = React.memo(WrappedResultSection);
export default ResultSection;
