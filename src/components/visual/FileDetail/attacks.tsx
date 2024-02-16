import { Grid, Skeleton } from '@mui/material';
import useHighlighter from 'components/hooks/useHighlighter';
import { AttackMatrix } from 'components/models/ui/file';
import Attack from 'components/visual/Attack';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';

type AttackSectionProps = {
  attacks: AttackMatrix;
  force?: boolean;
  nocollapse?: boolean;
};

const WrappedAttackSection: React.FC<AttackSectionProps> = ({ attacks, force = false, nocollapse = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const { getKey } = useHighlighter();

  return !attacks || Object.keys(attacks).length !== 0 ? (
    <SectionContainer title={t('attack_matrix')} nocollapse={nocollapse}>
      {attacks
        ? Object.keys(attacks).map((cat, i) => (
            <Grid container key={i}>
              <Grid item xs={12} sm={3} lg={2}>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{cat.replace(/-/g, ' ')}</span>
              </Grid>
              <Grid item xs={12} sm={9} lg={10}>
                {attacks[cat].map(([cid, mat, lvl], idx) => (
                  <Attack
                    key={`${cid}_${idx}`}
                    text={mat}
                    lvl={lvl}
                    highlight_key={getKey('attack_pattern', cid)}
                    force={force}
                  />
                ))}
              </Grid>
            </Grid>
          ))
        : [...Array(3)].map((_, i) => (
            <Grid container key={i} spacing={1}>
              <Grid item xs={12} sm={3} lg={2}>
                <Skeleton style={{ height: '2rem' }} />
              </Grid>
              <Grid item xs={12} sm={9} lg={10}>
                <Skeleton style={{ height: '2rem' }} />
              </Grid>
            </Grid>
          ))}
    </SectionContainer>
  ) : null;
};

const AttackSection = React.memo(WrappedAttackSection);
export default AttackSection;
