import type { SelectChangeEvent } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { getItems, getType, getValue, SelectField, useStore } from 'components/visual/HexViewer';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexSearchModeTextSpanSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { update } = useStore();

  return (
    <SelectField
      label={t('search.mode.textSpan.label')}
      description={t('search.mode.textSpan.description')}
      value={getValue.search.mode.textSpan(store.setting.search.mode.textSpan)}
      items={getItems.search.mode.textSpan(store)}
      onChange={(event: SelectChangeEvent<number>, child: React.ReactNode) =>
        update.store.setting.search.mode.setTextSpan(getType.search.mode.textSpan(event.target.value as number))
      }
    />
  );
};

export const HexSearchModeTextSpanSetting = React.memo(
  WrappedHexSearchModeTextSpanSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.search.mode.textSpan === nextProps.store.setting.search.mode.textSpan &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
