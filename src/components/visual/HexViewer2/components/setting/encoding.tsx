import { ChangeEvent, default as React, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HIGHER_ENCODING_SETTING_VALUES,
  LOWER_ENCODING_SETTING_VALUES,
  OutlinedField,
  SelectField,
  StoreProps,
  useDispatch
} from '../..';

export const WrappedHexEncoding = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { onSettingEncodingChange, onSettingHexCharChange } = useDispatch();

  const language = store.mode.language;
  const [lowerValues, setLowerValues] = useState<Array<{ label: string; value: number }>>(
    LOWER_ENCODING_SETTING_VALUES[language]
  );
  const [higherValues, setHigherValues] = useState<Array<{ label: string; value: number }>>(
    HIGHER_ENCODING_SETTING_VALUES[language]
  );
  useLayoutEffect(() => setLowerValues(LOWER_ENCODING_SETTING_VALUES[language]), [language]);
  useLayoutEffect(() => setHigherValues(HIGHER_ENCODING_SETTING_VALUES[language]), [language]);

  return (
    <>
      <OutlinedField
        label={t('null.char.label')}
        description={t('null.char.description')}
        value={store.setting.hex.null.char}
        onChange={event => onSettingHexCharChange('null', event.target.value)}
      />
      <SelectField
        label={t('lower.encoding.label')}
        description={t('lower.encoding.description')}
        value={store.setting.hex.lower.encoding}
        items={lowerValues}
        onChange={(event: ChangeEvent<{ name?: string; value: unknown }>) =>
          onSettingEncodingChange('lower', event.target.value as number)
        }
      />
      {store.setting.hex.lower.encoding === 0 ? (
        <OutlinedField
          label={t('lower.char.label')}
          description={t('lower.char.description')}
          value={store.setting.hex.lower.char}
          onChange={event => onSettingHexCharChange('lower', event.target.value)}
        />
      ) : (
        <></>
      )}
      <SelectField
        label={t('higher.encoding.label')}
        description={t('higher.encoding.description')}
        value={store.setting.hex.higher.encoding}
        items={higherValues}
        onChange={(event: ChangeEvent<{ name?: string; value: unknown }>) =>
          onSettingEncodingChange('higher', event.target.value as number)
        }
      />
      {store.setting.hex.higher.encoding === 0 ? (
        <OutlinedField
          label={t('higher.char.label')}
          description={t('higher.char.description')}
          value={store.setting.hex.higher.char}
          onChange={event => onSettingHexCharChange('higher', event.target.value)}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export const HexEncoding = React.memo(
  WrappedHexEncoding,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.hex === nextProps.store.setting.hex &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
