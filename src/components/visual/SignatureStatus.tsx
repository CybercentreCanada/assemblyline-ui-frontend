import type { ChipProps } from '@mui/material';
import type { RuleStatus } from 'components/models/base/signature';
import type { PossibleColor } from 'components/models/utils/color';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomChip from './CustomChip';

const COLOR_MAP: Record<RuleStatus, PossibleColor> = {
  DEPLOYED: 'success',
  NOISY: 'info',
  DISABLED: 'error',
  STAGING: 'default',
  TESTING: 'default',
  INVALID: 'default'
} as const;

interface Props extends Omit<ChipProps, 'size'> {
  fullWidth?: boolean;
  size?: 'tiny' | 'small' | 'medium';
  status: RuleStatus;
}

const WrappedSignatureStatus: React.FC<Props> = ({
  status,
  fullWidth = true,
  onClick = null,
  size = 'small',
  variant = 'filled',
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <CustomChip
      size={size}
      fullWidth={fullWidth}
      color={COLOR_MAP[status]}
      variant={variant}
      label={t(`signature.status.${status}`)}
      onClick={onClick}
      {...props}
    />
  );
};

const SignatureStatus = React.memo(WrappedSignatureStatus);
export default SignatureStatus;
