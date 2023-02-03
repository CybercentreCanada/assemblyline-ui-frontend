import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent, default as React } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getItems,
  getType,
  getValue,
  isType,
  OutlinedField,
  SelectField,
  singleCharacterString,
  StoreProps,
  useStore
} from '../..';

export const WrappedHexSetSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const { update } = useStore();

  return (
    <>
      <OutlinedField
        label={t('null.char.label')}
        description={t('null.char.description')}
        value={store.setting.hex.null.char}
        onChange={(event: ChangeEvent<any>) =>
          update.store.setting.hex.null.setChar(singleCharacterString(event.target.value, ' '))
        }
      />
      <SelectField
        label={t('nonPrintable.encoding.label')}
        description={t('nonPrintable.encoding.description')}
        value={getValue.hex.nonPrintable.set(store.setting.hex.nonPrintable.set)}
        items={getItems.hex.nonPrintable.set(store)}
        onChange={(event: SelectChangeEvent<number>, child: React.ReactNode) =>
          update.store.setting.hex.nonPrintable.setSet(getType.hex.nonPrintable.set(event.target.value as number))
        }
      />
      {isType.hex.nonPrintable.set(store.setting, 'hidden') ? (
        <OutlinedField
          label={t('nonPrintable.char.label')}
          description={t('nonPrintable.char.description')}
          value={store.setting.hex.nonPrintable.char}
          onChange={(event: ChangeEvent<any>) =>
            update.store.setting.hex.nonPrintable.setChar(singleCharacterString(event.target.value, ' '))
          }
        />
      ) : (
        <></>
      )}
      <SelectField
        label={t('higher.encoding.label')}
        description={t('higher.encoding.description')}
        value={getValue.hex.higher.set(store.setting.hex.higher.set)}
        items={getItems.hex.higher.set(store)}
        onChange={(event: ChangeEvent<any>) =>
          update.store.setting.hex.higher.setSet(getType.hex.higher.set(event.target.value as number))
        }
      />
      {isType.hex.higher.set(store.setting, 'hidden') ? (
        <OutlinedField
          label={t('higher.char.label')}
          description={t('higher.char.description')}
          value={store.setting.hex.higher.char}
          onChange={(event: ChangeEvent<any>) =>
            update.store.setting.hex.higher.setChar(singleCharacterString(event.target.value, ' '))
          }
        />
      ) : (
        <></>
      )}
    </>
  );
};

export const HexSetSetting = React.memo(
  WrappedHexSetSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.hex === nextProps.store.setting.hex &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
