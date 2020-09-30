import { Box, Tooltip } from '@material-ui/core';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

type VerdictProps = {
  score: number;
  short?: boolean;
  variant?: 'outlined' | 'default';
  size?: 'tiny' | 'small' | 'medium';
};

const Verdict: React.FC<VerdictProps> = ({ score, variant = 'default', size = 'tiny', short = false }) => {
  const { t } = useTranslation();

  const VERDICT_SCORE_MAP = {
    0: {
      shortText: t('verdict.non_malicious.short'),
      text: t('verdict.non_malicious'),
      color: 'default'
    },
    1: {
      shortText: t('verdict.safe.short'),
      text: t('verdict.safe'),
      color: 'success'
    },
    2: {
      shortText: t('verdict.suspicious.short'),
      text: t('verdict.suspicious'),
      color: 'info'
    },
    3: {
      shortText: t('verdict.highly_suspicious.short'),
      text: t('verdict.highly_suspicious'),
      color: 'warning'
    },
    4: {
      shortText: t('verdict.malicious.short'),
      text: t('verdict.malicious'),
      color: 'error'
    }
  };

  let scoreKey = null;
  if (score >= 2000) {
    scoreKey = 4;
  } else if (score >= 500) {
    scoreKey = 3;
  } else if (score >= 100) {
    scoreKey = 2;
  } else if (score < 0) {
    scoreKey = 1;
  } else {
    scoreKey = 0;
  }

  const { text, color, shortText } = VERDICT_SCORE_MAP[scoreKey];

  return (
    <Tooltip title={`${text} [Score: ${score}]`}>
      <Box display="inline">
        <CustomChip type="square" variant={variant} size={size} label={short ? shortText : text} color={color} />
      </Box>
    </Tooltip>
  );
};

export default Verdict;
