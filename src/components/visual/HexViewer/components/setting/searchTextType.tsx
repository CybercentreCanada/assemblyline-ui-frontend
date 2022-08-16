import React, { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEARCH_TEXT_TYPE_VALUES, SelectField, StoreProps, useDispatch } from '../..';

export const WrappedHexSearchTextTypeSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { onSettingSearchTextTypeChange } = useDispatch();

  const language = store.mode.languageType;
  const textTypeValue = store.setting.search.textType;
  const [values, setValues] = useState<Array<{ label: string; value: number }>>(SEARCH_TEXT_TYPE_VALUES[language]);
  useLayoutEffect(() => setValues(SEARCH_TEXT_TYPE_VALUES[language]), [language]);

  return (
    <SelectField
      label={t('searchTextType.label')}
      description={t('searchTextType.description')}
      value={textTypeValue}
      items={values}
      onChange={event => onSettingSearchTextTypeChange({ event })}
    />
  );
};

export const HexSearchTextTypeSetting = React.memo(
  WrappedHexSearchTextTypeSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.search.textType === nextProps.store.setting.search.textType &&
    prevProps.store.mode.languageType === nextProps.store.mode.languageType
);
