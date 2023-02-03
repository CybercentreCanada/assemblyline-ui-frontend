import { SelectChangeEvent } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getItems, getType, getValue, SelectField, StoreProps, useStore } from '../..';

export const WrappedHexSearchModeEncodingSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { update } = useStore();

  return (
    <SelectField
      label={t('search.mode.encoding.label')}
      description={t('search.mode.encoding.description')}
      value={getValue.search.mode.encoding(store.setting.search.mode.encoding)}
      items={getItems.search.mode.encoding(store)}
      onChange={(event: SelectChangeEvent<number>, child: React.ReactNode) =>
        update.store.setting.search.mode.setEncoding(getType.search.mode.encoding(event.target.value as number))
      }
    />
  );
};

export const HexSearchModeEncodingSetting = React.memo(
  WrappedHexSearchModeEncodingSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.search.mode.encoding === nextProps.store.setting.search.mode.encoding &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
