import BackspaceIcon from '@mui/icons-material/Backspace';
import type { IconButtonProps } from '@mui/material';
import {
  alpha,
  Box,
  Divider,
  IconButton,
  LinearProgress,
  styled,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import type { IndexDefinition } from 'components/models/ui/user';
import SearchTextField from 'components/visual/SearchBar/search-textfield';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Root = styled('div')(({ theme }) => ({
  '& button': {
    marginRight: theme.spacing(1)
  }
}));

export interface SearchBarButton {
  icon: React.ReactElement;
  props: IconButtonProps;
  tooltip?: string;
}

interface SearchBarProps {
  children?: React.ReactNode;
  initValue: string;
  placeholder?: string;
  searching?: boolean;
  buttons?: SearchBarButton[];
  extras?: React.ReactNode;
  suggestions?: IndexDefinition;
  onValueChange?: (filterValue: string) => void;
  onSearch: (filterValue: string, inputElement: HTMLInputElement) => void;
  onClear: (inputElement: HTMLInputElement) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initValue,
  children,
  placeholder,
  searching = false,
  suggestions = {},
  buttons = [],
  extras,
  onValueChange,
  onSearch,
  onClear
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const element = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>(initValue);
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  //
  const getInputEl = () => element.current.querySelector('input');

  // handler[onchange]: textfield change handler.
  // track value of filter..
  const _onValueChange = (_value: string) => {
    setValue(_value);
    onValueChange(_value);
  };

  // When clearing the filter value.
  const _onValueClear = () => {
    // textFieldEl.current.querySelector('input').focus();
    setValue('');
    onClear(getInputEl());
  };

  // When requesting a search.
  const _onSearch = () => {
    onSearch(value, getInputEl());
  };

  //
  useEffect(() => {
    setValue(initValue);
    getInputEl().focus();
  }, [initValue]);

  return (
    <Root ref={element}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        sx={{
          borderRadius: '4px',
          paddingLeft: theme.spacing(2),
          paddingRight: !extras ? theme.spacing(0.5) : null,
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.06)
          },
          '& input': {
            color: theme.palette.text.secondary
          }
        }}
      >
        <Box flex={1} display="relative">
          <SearchTextField
            value={value}
            placeholder={placeholder}
            options={suggestions}
            disabled={searching}
            onChange={_onValueChange}
            onSearch={_onSearch}
            onClear={_onValueClear}
          />
        </Box>
        <Tooltip title={t('clear_filter')}>
          <span>
            <IconButton
              onClick={_onValueClear}
              edge="end"
              size={!upMD ? 'small' : 'large'}
              style={{ marginRight: theme.spacing(upMD ? 0 : 0.5) }}
              disabled={searching}
            >
              <BackspaceIcon fontSize={!upMD ? 'small' : 'medium'} />
            </IconButton>{' '}
          </span>
        </Tooltip>
        {buttons.length !== 0 && (
          <Divider
            orientation="vertical"
            flexItem
            style={{ marginLeft: theme.spacing(upMD ? 1 : 0.5), marginRight: theme.spacing(upMD ? 1 : 0.5) }}
          />
        )}
        {buttons.map((b, i) => {
          const button = (
            <IconButton
              {...b.props}
              edge="end"
              size={!upMD ? 'small' : 'large'}
              style={{ marginRight: theme.spacing(upMD ? 0 : 0.5) }}
              disabled={searching}
            >
              {b.icon}
            </IconButton>
          );
          return (
            <span key={`searchbar-button-${i}`}>
              {b.tooltip ? (
                <Tooltip title={b.tooltip}>
                  <div>{button}</div>
                </Tooltip>
              ) : (
                button
              )}
            </span>
          );
        })}
        {extras}
      </Box>
      {searching && (
        <LinearProgress
          style={{
            height: theme.spacing(upMD ? 0.5 : 0.25),
            marginTop: theme.spacing(upMD ? -0.5 : -0.25),
            width: '100%',
            borderRadius: '0 0 4px 4px'
          }}
        />
      )}
      <div
        style={{
          color: theme.palette.primary.light,
          paddingLeft: theme.spacing(1),
          paddingBottom: theme.spacing(1)
        }}
      >
        {children}
      </div>
    </Root>
  );
};

export default SearchBar;
