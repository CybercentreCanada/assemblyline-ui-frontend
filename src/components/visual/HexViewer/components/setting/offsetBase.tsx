import React, { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OFFSET_SETTING_VALUES, SelectField, StoreProps, useDispatch } from '../..';

export const WrappedHexOffsetBaseSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { onSettingOffsetBaseChange } = useDispatch();

  const language = store.mode.language;
  const offsetBaseValue = store.setting.offsetBase;
  const [values, setValues] = useState<Array<{ label: string; value: number }>>(OFFSET_SETTING_VALUES[language]);
  useLayoutEffect(() => setValues(OFFSET_SETTING_VALUES[language]), [language]);

  return (
    <SelectField
      label={t('base.label')}
      description={t('base.description')}
      value={offsetBaseValue}
      items={values}
      onChange={onSettingOffsetBaseChange}
    />
  );
};

export const HexOffsetBaseSetting = React.memo(
  WrappedHexOffsetBaseSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.offsetBase === nextProps.store.setting.offsetBase &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
