import BackspaceIcon from '@mui/icons-material/Backspace';
import type { IconButtonProps, PopoverProps, TooltipProps } from '@mui/material';
import {
  Divider,
  IconButton,
  LinearProgress,
  Pagination,
  Popover,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import PageHeader from 'commons/components/pages/PageHeader';
import type { CustomChipProps } from 'components/visual/CustomChip';
import CustomChip from 'components/visual/CustomChip';
import SearchTextField from 'components/visual/SearchBar/search-textfield';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchCount from './SearchCount';

const useStyles = makeStyles(theme => ({
  root: {
    // marginTop: theme.spacing(1),
    // marginBottom: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(0.5)
  },

  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5)
  },

  searchWrapper: {
    borderRadius: theme.spacing(0.5),
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.06)
    },
    '& input': {
      color: theme.palette.text.secondary
    }
  },

  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(0.5),
    [theme.breakpoints.up('md')]: {
      columnGap: theme.spacing(0)
    }
  },

  linearProgress: {
    flexBasis: '100%',
    height: theme.spacing(0.25),
    marginTop: theme.spacing(-0.25),
    width: '100%',
    borderRadius: '0 0 4px 4px',
    [theme.breakpoints.up('md')]: {
      height: theme.spacing(0.5),
      marginTop: theme.spacing(-0.5)
    }
  },

  divider: {
    margin: `0 ${theme.spacing(0)}`,
    [theme.breakpoints.up('md')]: {
      margin: `0 ${theme.spacing(0.75)}`
    }
  },

  chiplist: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    boxShadow: 'inherit',
    margin: 0
  },

  chip: {
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(1)
  }
}));

const MAX_TRACKED_RECORDS = 10000;

type SearchParam = {
  query: string;
  offset: number;
  rows: number;
  filters: string[];
  trackTotalHits: number;
};

interface StyledPaperProps extends IconButtonProps {
  tooltipTitle?: TooltipProps['title'];
  tooltipPlacement?: TooltipProps['placement'];
}

type PopoverChipProps = {
  chip?: CustomChipProps;
  popover?: PopoverProps;
  children?: ReactNode;
};

const WrappedPopoverChip = ({ chip, popover, children }: PopoverChipProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const ref = useRef();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // const handleClick = () => {
  //   setAnchorEl(ref.current);
  //   // setAnchorEl(event.);
  // };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <CustomChip
        className={classes.chip}
        ref={ref}
        size="small"
        variant="outlined"
        wrap
        {...chip}
        onClick={handleClick}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        {children}
      </Popover>
    </>
  );
};

const PopoverChip = React.memo(WrappedPopoverChip);

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
  max?: number;
  isSticky?: boolean;
  results?: {
    items: unknown[];
    offset: number;
    rows: number;
    total: number;
  };
  disableCount?: boolean;
  disableTotalResults?: boolean;
  disablePagination?: boolean;
  disableFilterList?: boolean;
  onChange?: (value: URLSearchParams) => void;
  onValueChange?: (filterValue: string) => void;

  totalHitsTitle?: ReactNode; // result types

  renderTotalResults?: () => ReactNode;
  renderPagination?: () => ReactNode;
  renderFilterList?: () => ReactNode;
  renderFilter?: (filter: string) => CustomChipProps;
  renderExtraFilters?: () => CustomChipProps[];
  renderPopoverFilters?: () => PopoverChipProps[];
  hideFilters?: (filter: string) => boolean;

  endAdornment?: ReactNode;
  buttonProps?: StyledPaperProps[]; // endButtonProps
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
    filters: filtersDefaultValue = [],
    trackTotalHits: trackTotalHitsValue = 10000
  },
  paramKeys: {
    query: queryKey = 'query',
    offset: offsetKey = 'offset',
    rows: rowsKey = 'rows',
    filters: filtersKey = 'filters',
    trackTotalHits: trackTotalHitsKey = 'track_total_hits'
  },
  total = null,
  isSticky = true,
  disableCount = false,
  disableTotalResults = false,
  disablePagination = false,
  disableFilterList = false,
  onChange = () => null,
  onValueChange = () => null,

  totalHitsTitle = null,

  renderTotalResults = null,
  renderPagination = null,
  renderFilterList = null,
  renderFilter = null,
  renderExtraFilters = null,
  hideFilters = () => false,
  renderPopoverFilters = null,

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

  const handleCountClick = useCallback(() => {
    params.set(trackTotalHitsKey, Number(1000000000).toString());
    onChange(params);
  }, [onChange, params, trackTotalHitsKey]);

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
      params.append(filtersKey, newFilter);
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
      <div ref={rootRef} className={classes.root}>
        <div className={classes.searchWrapper} ref={inputRef}>
          <div className={classes.searchContainer}>
            <div ref={inputRef} style={{ flex: 1 }}>
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
              <div>
                <IconButton disabled={loading} size={!upMD ? 'small' : 'large'} onClick={handleQueryClear}>
                  <BackspaceIcon fontSize={!upMD ? 'small' : 'medium'} />
                </IconButton>
              </div>
            </Tooltip>
            {(endAdornment || buttonProps.length !== 0) && (
              <Divider className={classes.divider} orientation="vertical" flexItem />
            )}
            {buttonProps.map(({ tooltipTitle, tooltipPlacement, ...b }, i) =>
              tooltipTitle ? (
                <Tooltip key={`searchbar-button-${i}`} title={tooltipTitle} placement={tooltipPlacement}>
                  <div>
                    <IconButton size={!upMD ? 'small' : 'large'} disabled={loading} {...b} />
                  </div>
                </Tooltip>
              ) : (
                <IconButton key={`searchbar-button-${i}`} size={!upMD ? 'small' : 'large'} disabled={loading} {...b} />
              )
            )}
            {endAdornment}
          </div>

          {loading && <LinearProgress className={classes.linearProgress} />}
        </div>

        {/** Result Count */}
        <div className={classes.container} style={{ justifyContent: 'flex-end', fontStyle: 'italic' }}>
          <div style={{ flexGrow: 1 }}>
            {disableCount ? null : (
              <SearchCount
                loading={loading}
                max={(() => {
                  const val = Number(params.get(trackTotalHitsKey));
                  return isNaN(val) ? trackTotalHitsValue : val;
                })()}
                suffix={totalHitsTitle}
                total={total}
                onClick={() => handleCountClick()}
              />
            )}
          </div>

          {/** Pagination */}
          {disablePagination
            ? null
            : renderPagination
            ? renderPagination()
            : count &&
              count > 1 &&
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

        {/** Filters */}
        {disableFilterList
          ? null
          : params && (
              <ul className={clsx(classes.container, classes.chiplist)}>
                {renderPopoverFilters &&
                  renderPopoverFilters().map((props, i) => (
                    <li key={`popoverchiplist-${i}`}>
                      <PopoverChip {...props} />
                    </li>
                  ))}

                {renderExtraFilters &&
                  renderExtraFilters().map((cp, i) => (
                    <li key={`chiplistextra-${i}`}>
                      <CustomChip className={classes.chip} size="small" variant="outlined" wrap {...cp} />
                    </li>
                  ))}

                {params
                  .getAll(filtersKey)
                  .filter(f => !hideFilters(f))
                  .map((f, i) => (
                    <li key={`chiplist-${i}`}>
                      <CustomChip
                        className={classes.chip}
                        label={f.startsWith('NOT(') && f.endsWith(')') ? f.substring(4, f.length - 1) : f}
                        color={f.startsWith('NOT(') && f.endsWith(')') ? 'error' : null}
                        size="small"
                        variant="outlined"
                        wrap
                        onClick={() => handleFilterClick(f)}
                        onDelete={() => handleFilterDelete(f)}
                      />
                    </li>
                  ))}
                {/* <ChipList
                  items={params.getAll(filtersKey).map(v => ({
                    variant: 'outlined',
                    label: v.startsWith('NOT(') && v.endsWith(')') ? v.substring(4, v.length - 1) : v,
                    color: v.startsWith('NOT(') && v.endsWith(')') ? 'error' : null,
                    onClick: () => handleFilterClick(v),
                    onDelete: () => handleFilterDelete(v)
                  }))}
                /> */}
              </ul>
            )}

        {/** Other Components */}
        {children && <div className={classes.container}>{children}</div>}
      </div>
    </PageHeader>
  );
};

export const SearchHeader = React.memo(WrappedSearchHeader);
export default SearchHeader;
