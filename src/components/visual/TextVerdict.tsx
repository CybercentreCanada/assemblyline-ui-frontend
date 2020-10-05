import { Tooltip } from '@material-ui/core';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const VERDICT_COLOR_MAP = {
  info: 'default',
  safe: 'success',
  suspicious: 'warning',
  malicious: 'error'
};

type TextVerdictProps = {
  verdict: string;
  variant?: 'outlined' | 'default';
  size?: 'tiny' | 'small' | 'medium';
  mono?: boolean;
};

const TextVerdict: React.FC<TextVerdictProps> = ({ verdict, variant = 'default', size = 'tiny', mono = false }) => {
  const { t } = useTranslation();
  const color = VERDICT_COLOR_MAP[verdict];

  return (
    <Tooltip title={t(`verdict.${verdict}`)}>
      <span>
        <CustomChip
          type="square"
          variant={variant}
          size={size}
          label={t(`verdict.${verdict}.short`)}
          color={color}
          mono={mono}
        />
      </span>
    </Tooltip>
  );
};

export default TextVerdict;
