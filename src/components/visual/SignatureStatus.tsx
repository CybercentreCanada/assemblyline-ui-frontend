import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomChip from './CustomChip';

const COLOR_MAP = {
  DEPLOYED: 'success' as 'success',
  NOISY: 'info' as 'info',
  DISABLED: 'error' as 'error'
};

type SignatureStatusProps = {
  status: 'DEPLOYED' | 'NOISY' | 'DISALBED';
  fullWidth?: boolean;
};

const WrappedSignatureStatus: React.FC<SignatureStatusProps> = ({ status, fullWidth = true }) => {
  const { t } = useTranslation();

  return (
    <CustomChip size="tiny" fullWidth={fullWidth} color={COLOR_MAP[status]} label={t(`signature.status.${status}`)} />
  );
};

const SignatureStatus = React.memo(WrappedSignatureStatus);
export default SignatureStatus;
