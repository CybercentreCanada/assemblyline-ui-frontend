import { makeStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExposureZeroIcon from '@material-ui/icons/ExposureZero';
import NavigationIcon from '@material-ui/icons/Navigation';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PopperIconButton, SearchType, StoreProps, useDispatch } from '../..';

const useHexStyles = makeStyles(theme => ({}));

export const WrappedHexSearchTypes = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();
  const ref = useRef(null);
  const { onSelectedSearchIndexChange, onSearchClear, onSearchTypeChange } = useDispatch();
  const { type } = store.search;

  const handleClick = useCallback(
    (_type: SearchType) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      onSearchTypeChange(_type);
      ref.current?.close();
    },
    [onSearchTypeChange]
  );

  return (
    <PopperIconButton
      ref={ref}
      title={t('search.types')}
      placement="bottom-start"
      size="small"
      icon={
        type === 'cursor' ? (
          <NavigationIcon />
        ) : // ) : type === 'select' ? (
        //   <SpaceBarIcon />
        type === 'hex' ? (
          <ExposureZeroIcon />
        ) : type === 'text' ? (
          <TextFieldsIcon />
        ) : null
      }
      field={
        <List component="nav" aria-label="main mailbox folders" dense disablePadding>
          <ListItem button selected={type === 'cursor'} onClick={handleClick('cursor')}>
            <ListItemIcon children={<NavigationIcon />} />
            <ListItemText primary={t('header.selector.cursor')} />
          </ListItem>
          {/* <ListItem button selected={type === 'select'} onClick={handleClick('select')}>
            <ListItemIcon children={<SpaceBarIcon />} />
            <ListItemText primary="Address Range" />
          </ListItem> */}
          <ListItem button selected={type === 'hex'} onClick={handleClick('hex')}>
            <ListItemIcon children={<ExposureZeroIcon />} />
            <ListItemText primary={t('header.selector.hexcode')} />
          </ListItem>
          <ListItem button selected={type === 'text'} onClick={handleClick('text')}>
            <ListItemIcon children={<TextFieldsIcon />} />
            <ListItemText primary={t('header.selector.text')} />
          </ListItem>
        </List>
      }
    />
  );
};

export const HexSearchTypes = React.memo(
  WrappedHexSearchTypes,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.type === nextProps.store.search.type
);
