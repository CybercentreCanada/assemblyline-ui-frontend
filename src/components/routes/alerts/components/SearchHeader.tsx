import BackspaceIcon from '@mui/icons-material/Backspace';
import type { IconButtonProps, TooltipProps } from '@mui/material';
import {
  Divider,
  IconButton,
  LinearProgress,
  Pagination,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import PageHeader from 'commons/components/pages/PageHeader';
import { ChipList } from 'components/visual/ChipList';
import SearchTextField from 'components/visual/SearchBar/search-textfield';
import SearchResultCount from 'components/visual/SearchResultCount';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  root: {
    '& button': {
      marginRight: theme.spacing(1)
    }
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '4px',
    paddingLeft: theme.spacing(2),
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.06)
    },
    '& input': {
      color: theme.palette.text.secondary
    }
  },
  container: {
    display: 'relative',
    flex: 1
  },
  // searchbar: {
  //   borderRadius: '4px',
  //   paddingLeft: theme.spacing(2),
  //   backgroundColor: alpha(theme.palette.text.primary, 0.04),
  //   '&:hover': {
  //     backgroundColor: alpha(theme.palette.text.primary, 0.06)
  //   },
  //   '& input': {
  //     color: theme.palette.text.secondary
  //   }
  // },
  searchresult: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    // fontStyle: 'italic',
    // color: theme.palette.primary.light,
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(0.5)
    // paddingBottom: theme.spacing(0.5)
  }
}));

const MAX_TRACKED_RECORDS = 10000;

type SearchParam = {
  query: string;
  offset: number;
  rows: number;
  filters: string[];
};

interface StyledPaperProps extends IconButtonProps {
  tooltipTitle?: TooltipProps['title'];
  tooltipPlacement?: TooltipProps['placement'];
}

type Props = {
  children?: ReactNode;
  value: string | string[][] | Record<string, string> | URLSearchParams;
  defaultValue?: Partial<SearchParam>;
  placeholder?: string;
  searchResultContent?: string;
  loading?: boolean;
  extras?: ReactNode;
  suggestions?: string[];
  pageSize?: number;
  paramKeys?: Partial<Record<keyof SearchParam, string>>;
  total?: number;
  isSticky?: boolean;
  results?: {
    items: unknown[];
    offset: number;
    rows: number;
    total: number;
  };
  disableTotalResults?: boolean;
  disablePagination?: boolean;
  disableFilterList?: boolean;
  onChange?: (value: URLSearchParams) => void;
  onValueChange?: (filterValue: string) => void;

  renderTotalResults?: () => ReactNode;
  renderFilterList?: () => ReactNode;
  renderPagination?: () => ReactNode;

  endAdornment?: ReactNode;
  buttonProps?: StyledPaperProps[];
};

const WrappedSearchHeader = ({
  children,
  value = '',
  placeholder,
  loading = false,
  suggestions = [],
  defaultValue: {
    query: queryDefaultValue = '*',
    offset: offsetDefaultValue = 0,
    rows: rowsDefaultValue = 25,
    filters: filtersDefaultValue = []
  },
  paramKeys: {
    query: queryKey = 'query',
    offset: offsetKey = 'offset',
    rows: rowsKey = 'rows',
    filters: filtersKey = 'filters'
  },
  total = null,
  isSticky = true,
  disableTotalResults = false,
  disablePagination = false,
  disableFilterList = false,
  onChange = () => null,
  onValueChange = () => null,

  renderTotalResults = null,
  renderFilterList = null,
  renderPagination = null,

  endAdornment = null,
  buttonProps = []
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  const params = useMemo<URLSearchParams>(() => new URLSearchParams(value), [value]);

  const [queryValue, setQueryValue] = useState<string>(
    !params.has(queryKey) ? queryDefaultValue : params.get(queryKey)
  );

  const rootRef = useRef<HTMLInputElement>();
  const inputRef = useRef<HTMLInputElement>();

  const page = useMemo<number>(
    () =>
      !params
        ? null
        : Math.ceil(
            Math.min(Number(params.get(offsetKey) || offsetDefaultValue), MAX_TRACKED_RECORDS) /
              Number(params.get(rowsKey) || rowsDefaultValue)
          ) + 1,
    [offsetDefaultValue, offsetKey, params, rowsDefaultValue, rowsKey]
  );

  const count = useMemo<number>(
    () =>
      !total ? null : Math.ceil(Math.min(total, MAX_TRACKED_RECORDS) / Number(params.get(rowsKey) || rowsDefaultValue)),
    [params, rowsDefaultValue, rowsKey, total]
  );

  const getInputEl = useCallback(() => inputRef.current.querySelector('input'), []);

  const handleQueryChange = useCallback(
    (v: string) => {
      setQueryValue(v);
      onValueChange(v);
    },
    [onValueChange]
  );

  const handleQueryClear = useCallback(() => {
    setQueryValue('');
    params.delete(queryKey);
    onChange(params);
  }, [onChange, queryKey, params]);

  const handleQuerySubmit = useCallback(
    (v: string) => {
      params.set(queryKey, v);
      params.set(offsetKey, '0');
      onChange(params);
    },
    [params, queryKey, offsetKey, onChange]
  );

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, p: number) => {
      params.set(offsetKey, ((p - 1) * (Number(params.get(rowsKey)) || rowsDefaultValue)).toString());
      onChange(params);
    },
    [offsetKey, onChange, params, rowsDefaultValue, rowsKey]
  );

  const handleFilterClick = useCallback(
    (f: string) => {
      const newFilter = f.startsWith('NOT(') && f.endsWith(')') ? f.substring(4, f.length - 1) : `NOT(${f})`;
      params.set(filtersKey, newFilter);
      params.set(offsetKey, '0');
      params.delete(filtersKey, f);
      onChange(params);
    },
    [filtersKey, offsetKey, onChange, params]
  );

  const handleFilterDelete = useCallback(
    (f: string) => {
      params.delete(filtersKey, f);
      params.set(offsetKey, '0');
      onChange(params);
    },
    [filtersKey, offsetKey, onChange, params]
  );

  useEffect(() => {
    setQueryValue(!params.has(queryKey) ? queryDefaultValue : params.get(queryKey));
  }, [params, queryDefaultValue, queryKey]);

  useEffect(() => {
    if (!loading) getInputEl().focus();
  }, [getInputEl, loading]);

  return (
    <PageHeader isSticky={isSticky}>
      <div style={{ paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) }}>
        <div ref={rootRef} className={classes.root}>
          <div className={classes.wrapper} style={{ paddingRight: !endAdornment ? theme.spacing(0.5) : null }}>
            <div className={classes.container} ref={inputRef}>
              <SearchTextField
                value={queryValue}
                placeholder={placeholder}
                options={suggestions}
                disabled={loading}
                onChange={v => handleQueryChange(v)}
                onSearch={() => handleQuerySubmit(queryValue)}
                onClear={() => handleQueryClear()}
              />
            </div>
            <Tooltip title={t('clear_filter')}>
              <span>
                <IconButton
                  edge="end"
                  size={!upMD ? 'small' : 'large'}
                  style={{ marginRight: theme.spacing(upMD ? 0 : 0.5) }}
                  disabled={loading}
                  onClick={handleQueryClear}
                >
                  <BackspaceIcon fontSize={!upMD ? 'small' : 'medium'} />
                </IconButton>
              </span>
            </Tooltip>
            {(endAdornment || buttonProps.length !== 0) && (
              <Divider
                orientation="vertical"
                flexItem
                style={{ marginLeft: theme.spacing(upMD ? 1 : 0.5), marginRight: theme.spacing(upMD ? 1 : 0.5) }}
              />
            )}
            {buttonProps.map((b, i) =>
              b?.tooltipTitle ? (
                <Tooltip key={`searchbar-button-${i}`} title={b.tooltipTitle} placement={b.tooltipPlacement}>
                  <span>
                    <IconButton
                      {...b}
                      edge="end"
                      size={!upMD ? 'small' : 'large'}
                      style={{ marginRight: theme.spacing(upMD ? 0 : 0.5) }}
                      disabled={loading}
                    />
                  </span>
                </Tooltip>
              ) : (
                <IconButton
                  {...b}
                  key={`searchbar-button-${i}`}
                  edge="end"
                  size={!upMD ? 'small' : 'large'}
                  style={{ marginRight: theme.spacing(upMD ? 0 : 0.5) }}
                  disabled={loading}
                />
              )
            )}
            {endAdornment}
          </div>
          {loading && (
            <LinearProgress
              style={{
                height: theme.spacing(upMD ? 0.5 : 0.25),
                marginTop: theme.spacing(upMD ? -0.5 : -0.25),
                width: '100%',
                borderRadius: '0 0 4px 4px'
              }}
            />
          )}
          <div className={classes.searchresult}>{children}</div>

          <div className={classes.searchresult} style={{ fontStyle: 'italic' }}>
            {disableTotalResults ? null : loading ? (
              <Typography variant="subtitle1" color="primary" style={{ flexGrow: 1 }} children={t('loading')} />
            ) : (
              total > 0 && (
                <Typography variant="subtitle1" color="primary" style={{ flexGrow: 1 }}>
                  <SearchResultCount count={total} />
                  {renderTotalResults()}
                </Typography>
              )
            )}

            {disablePagination
              ? null
              : renderPagination
              ? renderPagination()
              : count &&
                page && (
                  <Pagination
                    count={count}
                    page={page}
                    disabled={loading}
                    size="small"
                    shape="rounded"
                    onChange={handlePageChange}
                  />
                )}
          </div>

          {disableFilterList
            ? null
            : renderFilterList
            ? renderFilterList()
            : params && (
                <div>
                  <ChipList
                    items={params.getAll(filtersKey).map(v => ({
                      variant: 'outlined',
                      label: v.startsWith('NOT(') && v.endsWith(')') ? v.substring(4, v.length - 1) : v,
                      color: v.startsWith('NOT(') && v.endsWith(')') ? 'error' : null,
                      onClick: () => handleFilterClick(v),
                      onDelete: () => handleFilterDelete(v)
                    }))}
                  />
                </div>
              )}
        </div>
      </div>
    </PageHeader>
  );
};

export const SearchHeader = React.memo(WrappedSearchHeader);
export default SearchHeader;
