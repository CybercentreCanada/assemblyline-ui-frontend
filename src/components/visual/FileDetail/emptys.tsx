import { Skeleton } from '@mui/material';
import { FileResult } from 'components/models/base/result';
import ResultCard from 'components/visual/ResultCard';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';

type EmptySectionProps = {
  emptys: FileResult[];
  sid: string;
  nocollapse?: boolean;
};

const WrappedEmptySection: React.FC<EmptySectionProps> = ({ emptys, sid, nocollapse = false }) => {
  const { t } = useTranslation(['fileDetail']);

  return !emptys || emptys.length !== 0 ? (
    <SectionContainer title={t('emptys')} nocollapse={nocollapse}>
      {emptys
        ? emptys.map((result, i) => <ResultCard key={i} result={result} sid={sid} />)
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

const EmptySection = React.memo(WrappedEmptySection);
export default EmptySection;
