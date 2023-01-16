import { SelectChangeEvent } from '@mui/material';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';
import { getItems, getType, getValue, SelectField, StoreProps, useStore } from '../..';

export const WrappedHexEncodingSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { update } = useStore();

  return (
    <SelectField
      label={t('hex.byteSize.label')}
      description={t('hex.byteSize.description')}
      value={getValue.hex.encoding(store.setting.hex.encoding)}
      items={getItems.hex.encoding(store)}
      onChange={(event: SelectChangeEvent<number>, child: React.ReactNode) =>
        update.store.setting.hex.setEncoding(getType.hex.encoding(event.target.value as number))
      }
    />
  );
};

export const HexEncodingSetting = React.memo(
  WrappedHexEncodingSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.hex.encoding === nextProps.store.setting.hex.encoding &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
