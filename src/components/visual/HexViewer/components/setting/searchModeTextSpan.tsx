import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getItems, getType, getValue, SelectField, StoreProps, useStore } from '../..';

export const WrappedHexSearchModeTextSpanSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { update } = useStore();

  return (
    <SelectField
      label={t('search.mode.textSpan.label')}
      description={t('search.mode.textSpan.description')}
      value={getValue.search.mode.textSpan(store.setting.search.mode.textSpan)}
      items={getItems.search.mode.textSpan(store)}
      onChange={(event: ChangeEvent<{ name?: string; value: unknown }>) =>
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
