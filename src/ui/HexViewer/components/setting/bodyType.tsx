import type { SelectChangeEvent } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { getItems, getType, getValue, SelectField, useStore } from 'components/visual/HexViewer';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexBodyTypeSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { update } = useStore();

  return (
    <SelectField
      label={t('bodyType.label')}
      description={t('bodyType.description')}
      value={getValue.mode.body(store.setting.mode.body)}
      items={getItems.mode.body(store)}
      onChange={(event: SelectChangeEvent<number>, child: React.ReactNode) =>
        update.store.setting.mode.setBody(getType.mode.body(event.target.value as number))
      }
    />
  );
};

export const HexBodyTypeSetting = React.memo(
  WrappedHexBodyTypeSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.mode.body === nextProps.store.setting.mode.body &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
