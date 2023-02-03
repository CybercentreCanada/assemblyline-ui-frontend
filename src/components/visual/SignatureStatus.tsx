import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomChip from './CustomChip';

const COLOR_MAP = {
  DEPLOYED: 'success' as 'success',
  NOISY: 'info' as 'info',
  DISABLED: 'error' as 'error'
};

type SignatureStatusProps = {
  status: 'DEPLOYED' | 'NOISY' | 'DISABLED';
  fullWidth?: boolean;
  size?: 'tiny' | 'small' | 'medium';
  variant?: 'outlined' | 'filled';
  onClick?: () => void;
};

const WrappedSignatureStatus: React.FC<SignatureStatusProps> = ({
  status,
  fullWidth = true,
  onClick = null,
  size = 'small',
  variant = 'filled'
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
    />
  );
};

const SignatureStatus = React.memo(WrappedSignatureStatus);
export default SignatureStatus;
