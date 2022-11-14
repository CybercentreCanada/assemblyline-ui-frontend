import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getItems, getType, getValue, SelectField, StoreProps, useStore } from '../..';

export const WrappedHexOffsetBaseSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { update } = useStore();

  return (
    <SelectField
      label={t('base.label')}
      description={t('base.description')}
      value={getValue.offset.base(store.setting.offset.base)}
      items={getItems.offset.base(store)}
      onChange={(event: ChangeEvent<{ name?: string; value: unknown }>) =>
        update.store.setting.offset.setBase(getType.offset.base(event.target.value as number))
      }
    />
  );
};

export const HexOffsetBaseSetting = React.memo(
  WrappedHexOffsetBaseSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.offset.base === nextProps.store.setting.offset.base &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
