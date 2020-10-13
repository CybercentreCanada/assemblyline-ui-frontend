import { Tooltip, useTheme } from '@material-ui/core';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

type VerdictProps = {
  score: number;
  short?: boolean;
  variant?: 'outlined' | 'default';
  size?: 'tiny' | 'small' | 'medium';
  type?: 'square' | 'text';
  mono?: boolean;
};

const Verdict: React.FC<VerdictProps> = ({
  score,
  type = 'square',
  variant = 'default',
  size = 'tiny',
  short = false,
  mono = false
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const VERDICT_SCORE_MAP = {
    0: {
      shortText: t('verdict.non_malicious.short'),
      text: t('verdict.non_malicious'),
      color: 'default',
      textColor: theme.palette.type === 'dark' ? '#AAA' : '#888'
    },
    1: {
      shortText: t('verdict.safe.short'),
      text: t('verdict.safe'),
      color: 'success',
      textColor: theme.palette.type !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
    },
    2: {
      shortText: t('verdict.suspicious.short'),
      text: t('verdict.suspicious'),
      color: 'info',
      textColor: theme.palette.type !== 'dark' ? theme.palette.info.dark : theme.palette.info.light
    },
    3: {
      shortText: t('verdict.highly_suspicious.short'),
      text: t('verdict.highly_suspicious'),
      color: 'warning',
      textColor: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
    },
    4: {
      shortText: t('verdict.malicious.short'),
      text: t('verdict.malicious'),
      color: 'error',
      textColor: theme.palette.type !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
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

  const { text, color, shortText, textColor } = VERDICT_SCORE_MAP[scoreKey];

  return (
    <Tooltip title={`${text} [Score: ${score}]`}>
      <span>
        {type === 'text' ? (
          <span style={{ fontWeight: 500, color: textColor }}>{text}</span>
        ) : (
          <CustomChip
            type="square"
            variant={variant}
            size={size}
            label={short ? shortText : text}
            color={color}
            mono={mono}
          />
        )}
      </span>
    </Tooltip>
  );
};

export default Verdict;
