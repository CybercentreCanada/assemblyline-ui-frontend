import { Tooltip, useTheme } from '@material-ui/core';
import CustomChip from 'components/visual/CustomChip';
import { scoreToVerdict } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

type VerdictProps = {
  score: number;
  short?: boolean;
  variant?: 'outlined' | 'default';
  size?: 'tiny' | 'small' | 'medium';
  type?: 'rounded' | 'text';
  mono?: boolean;
  fullWidth?: boolean;
};

const WrappedVerdict: React.FC<VerdictProps> = ({
  score,
  type = 'rounded',
  variant = 'default',
  size = 'tiny',
  short = false,
  mono = false,
  fullWidth = false
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const VERDICT_SCORE_MAP = {
    info: {
      shortText: t('verdict.info.short'),
      text: t('verdict.info'),
      color: 'default' as 'default',
      textColor: theme.palette.type === 'dark' ? '#AAA' : '#888'
    },
    safe: {
      shortText: t('verdict.safe.short'),
      text: t('verdict.safe'),
      color: 'success' as 'success',
      textColor: theme.palette.type !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
    },
    suspicious: {
      shortText: t('verdict.suspicious.short'),
      text: t('verdict.suspicious'),
      color: 'warning' as 'warning',
      textColor: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
    },
    highly_suspicious: {
      shortText: t('verdict.highly_suspicious.short'),
      text: t('verdict.highly_suspicious'),
      color: 'warning' as 'warning',
      textColor: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
    },
    malicious: {
      shortText: t('verdict.malicious.short'),
      text: t('verdict.malicious'),
      color: 'error' as 'error',
      textColor: theme.palette.type !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
    }
  };

  const { text, color, shortText, textColor } = VERDICT_SCORE_MAP[scoreToVerdict(score)];

  return (
    <Tooltip title={`${text} [Score: ${score}]`}>
      <span>
        {type === 'text' ? (
          <span style={{ fontWeight: 500, color: textColor }}>{text}</span>
        ) : (
          <CustomChip
            type={type}
            variant={variant}
            size={size}
            label={short ? shortText : text}
            color={color}
            mono={mono}
            fullWidth={fullWidth}
          />
        )}
      </span>
    </Tooltip>
  );
};

const Verdict = React.memo(WrappedVerdict);
export default Verdict;
