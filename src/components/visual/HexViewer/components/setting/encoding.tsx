import { ChangeEvent, default as React, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HIGHER_ENCODING_SETTING_VALUES,
  NON_PRINTABLE_ENCODING_SETTING_VALUES,
  OutlinedField,
  SelectField,
  StoreProps,
  useDispatch
} from '../..';

export const WrappedHexEncoding = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { onSettingEncodingChange, onSettingHexCharChange } = useDispatch();

  const language = store.mode.languageType;
  const [nonPrintableValues, setNonPrintableValues] = useState<Array<{ label: string; value: number }>>(
    NON_PRINTABLE_ENCODING_SETTING_VALUES[language]
  );
  const [higherValues, setHigherValues] = useState<Array<{ label: string; value: number }>>(
    HIGHER_ENCODING_SETTING_VALUES[language]
  );
  useLayoutEffect(() => setNonPrintableValues(NON_PRINTABLE_ENCODING_SETTING_VALUES[language]), [language]);
  useLayoutEffect(() => setHigherValues(HIGHER_ENCODING_SETTING_VALUES[language]), [language]);

  return (
    <>
      <OutlinedField
        label={t('null.char.label')}
        description={t('null.char.description')}
        value={store.setting.hex.null.char}
        onChange={event => onSettingHexCharChange({ key: 'null', value: event.target.value })}
      />
      <SelectField
        label={t('nonPrintable.encoding.label')}
        description={t('nonPrintable.encoding.description')}
        value={store.setting.hex.nonPrintable.encoding}
        items={nonPrintableValues}
        onChange={(event: ChangeEvent<{ name?: string; value: unknown }>) =>
          onSettingEncodingChange({ key: 'nonPrintable', value: event.target.value as number })
        }
      />
      {store.setting.hex.nonPrintable.encoding === 0 ? (
        <OutlinedField
          label={t('nonPrintable.char.label')}
          description={t('nonPrintable.char.description')}
          value={store.setting.hex.nonPrintable.char}
          onChange={event => onSettingHexCharChange({ key: 'nonPrintable', value: event.target.value })}
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
          onSettingEncodingChange({ key: 'higher', value: event.target.value as number })
        }
      />
      {store.setting.hex.higher.encoding === 0 ? (
        <OutlinedField
          label={t('higher.char.label')}
          description={t('higher.char.description')}
          value={store.setting.hex.higher.char}
          onChange={event => onSettingHexCharChange({ key: 'higher', value: event.target.value })}
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
    prevProps.store.mode.languageType === nextProps.store.mode.languageType
);
