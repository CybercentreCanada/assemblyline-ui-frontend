import React, { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BODY_TYPE_SETTING_VALUES, SelectField, StoreProps, useDispatch } from '../..';

export const WrappedHexBodyTypeSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { onSettingBodyTypeChange } = useDispatch();

  const language = store.mode.language;
  const value = store.setting.bodyType;
  const [items, setItems] = useState<Array<{ label: string; value: number }>>(BODY_TYPE_SETTING_VALUES[language]);
  useLayoutEffect(() => setItems(BODY_TYPE_SETTING_VALUES[language]), [language]);

  return (
    <SelectField
      label={t('bodyType.label')}
      description={t('bodyType.description')}
      value={value}
      items={items}
      onChange={onSettingBodyTypeChange}
    />
  );
};

export const HexBodyTypeSetting = React.memo(
  WrappedHexBodyTypeSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.bodyType === nextProps.store.setting.bodyType &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
