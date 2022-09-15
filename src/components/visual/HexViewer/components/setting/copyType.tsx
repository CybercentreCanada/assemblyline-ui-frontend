import { ChangeEvent, default as React, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NON_PRINTABLE_COPY_TYPE_VALUES, SelectField, StoreProps, useDispatch } from '../..';

export const WrappedCopyTypeSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { onSettingCopyNonPrintableTypeChange } = useDispatch();

  const language = store.mode.languageType;
  const [values, setValues] = useState<Array<{ label: string; value: number }>>(
    NON_PRINTABLE_COPY_TYPE_VALUES[language]
  );
  useLayoutEffect(() => setValues(NON_PRINTABLE_COPY_TYPE_VALUES[language]), [language]);

  return (
    <>
      <SelectField
        label={t('copy.nonPrintable.type.label')}
        description={t('copy.nonPrintable.type.description')}
        value={store.setting.copy.nonPrintable.type}
        items={values}
        onChange={(event: ChangeEvent<{ name?: string; value: unknown }>) =>
          onSettingCopyNonPrintableTypeChange({ event })
        }
      />
    </>
  );
};

export const CopyTypeSetting = React.memo(
  WrappedCopyTypeSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.copy.nonPrintable.type === nextProps.store.setting.copy.nonPrintable.type &&
    prevProps.store.setting.copy.nonPrintable.prefix === nextProps.store.setting.copy.nonPrintable.prefix &&
    prevProps.store.mode.languageType === nextProps.store.mode.languageType
);
