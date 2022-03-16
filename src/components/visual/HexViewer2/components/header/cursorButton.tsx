import NavigationIcon from '@material-ui/icons/Navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumericField, PopperIconButton, StoreProps, useDispatch, useReducer } from '../..';

export const WrappedHexCursorButton = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);

  const { refs } = useReducer();
  const { onCursorIndexChange } = useDispatch();

  const {
    cursor: { index: cursorIndex },
    offset: { base: offsetBase }
  } = store;
  const { codes: hexcodes } = refs.current.hex;

  return (
    <PopperIconButton
      title={t('offset.title')}
      icon={<NavigationIcon />}
      field={
        <NumericField
          id="cursor-index"
          label={t('offset.label')}
          placeholder={t('offset.placeholder')}
          fullWidth
          margin="dense"
          range="loop"
          value={cursorIndex as number}
          labelWidth={100}
          min={0}
          max={hexcodes.size - 1}
          base={offsetBase}
          autoFocus
          allowNull={true}
          direction="inverse"
          onChange={event => {
            onCursorIndexChange(event.target.valueAsNumber as number);
          }}
        />
      }
    />
  );
};

export const HexCursorButton = React.memo(
  WrappedHexCursorButton,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.cursor.index === nextProps.store.cursor.index &&
    prevProps.store.offset.base === nextProps.store.offset.base
);
