import type { MuiColorType } from '@tui/core';
import type { FC } from 'react';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MxProps } from '.';
import { MODULE_NAME } from '../name';
import type { AppClassificationState, AppClassificationValue } from '../providers/AppClassificationProvider';
import { AppClassificationContext } from '../providers/AppClassificationProvider';
import type { AppClassificationBaseProps } from './AppClassificationBase';
import { AppClassificationBase } from './AppClassificationBase';

const AppClassificationColors: { [key in AppClassificationState]: MuiColorType } = {
  u: 'green',
  pa: 'lightBlue',
  pb: 'lightBlue',
  pc: 'lightBlue',
  c: 'blue',
  s: 'red',
  ts: 'orange',
  loading: 'grey',
  error: 'red'
};

const I18nKeys = {
  longI18nKey: 'classification.long',
  shortI18nKey: 'classification.short'
};

type AppClassificationProps = {
  variant?: 'filled' | 'text' | 'outlined';
  full?: boolean;
  overwrite?: AppClassificationValue;
  mx?: MxProps;
};

export const AppClassification: FC<AppClassificationProps> = ({ variant, full, overwrite, mx }) => {
  const context = useContext(AppClassificationContext);
  const { i18n } = useTranslation(MODULE_NAME);

  const _value = overwrite || context?.value || 'error';

  const enClassiT = i18n.getFixedT('en', `${MODULE_NAME}.${_value}`);
  const frClassiT = i18n.getFixedT('fr', `${MODULE_NAME}.${_value}`);

  const configs: AppClassificationBaseProps = useMemo(
    () => ({
      short_text_en: enClassiT(I18nKeys.shortI18nKey),
      short_text_fr: frClassiT(I18nKeys.shortI18nKey),
      long_text_en: enClassiT(I18nKeys.longI18nKey),
      long_text_fr: frClassiT(I18nKeys.longI18nKey),
      color: AppClassificationColors[_value]
    }),
    [enClassiT, frClassiT, _value]
  );

  return <AppClassificationBase {...configs} variant={variant} full={full} state={_value} mx={mx} />;
};
