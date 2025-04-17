import BackspaceIcon from '@mui/icons-material/Backspace';
import type { IconButtonProps, PaginationProps, PopoverProps, SvgIconProps, TooltipProps } from '@mui/material';
import {
  Divider,
  IconButton,
  LinearProgress,
  Pagination,
  Popover,
  SvgIcon,
  Tooltip,
  alpha,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';
import PageHeader from 'commons/components/pages/PageHeader';
import type { CustomChipProps } from 'components/visual/CustomChip';
import CustomChip from 'components/visual/CustomChip';
import type { SearchTextFieldProps } from 'components/visual/SearchBar/search-textfield';
import SearchTextField from 'components/visual/SearchBar/search-textfield';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchCount, TOTAL_TRACKED_RECORDS } from './SearchCount';

const Root = styled('div')(({ theme }) => ({
  // marginTop: theme.spacing(1),
  // marginBottom: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(0.5)
}));

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(0.5)
}));

const SearchWrapper = styled('div')(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
  backgroundColor: alpha(theme.palette.text.primary, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.06)
  },
  '& input': {
    color: theme.palette.text.secondary
  }
}));

const SearchContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  columnGap: theme.spacing(0.5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(0.5),
  [theme.breakpoints.up('md')]: {
    columnGap: theme.spacing(0)
  }
}));

const ChipList = styled('ul')(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(0.5),
  listStyle: 'none',
  boxShadow: 'inherit',
  margin: 0
}));

const MAX_TRACKED_RECORDS = 1000000000;

type SearchParam = {
  query: string;
  offset: number;
  rows: number;
  filters: string[];
  track_total_hits: number;
};

type PopoverChipProps = {
  chip?: CustomChipProps;
  popover?: PopoverProps;
  children?: ReactNode;
};

const WrappedPopoverChip = ({ chip, popover, children }: PopoverChipProps) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const ref = useRef(null);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);

  return (
    <>
      <CustomChip
        ref={ref}
        size="small"
        variant="outlined"
        wrap
        sx={{
          marginBottom: theme.spacing(0.5),
          marginRight: theme.spacing(1)
        }}
        {...chip}
        onClick={handleClick}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        {...popover}
      >
        {children}
      </Popover>
    </>
  );
};

const PopoverChip = React.memo(WrappedPopoverChip);

type Props = {
  children?: ReactNode;

  params: string | string[][] | Record<string, string> | URLSearchParams;
  paramKeys?: Partial<Record<keyof SearchParam, string>>;
  paramDefaults?: Partial<SearchParam>;
  loading?: boolean;
  resultLabel?: ReactNode;
  results: {
    items: unknown[];
    offset: number;
    rows: number;
    total: number;
  };

  disable?: {
    count?: boolean;
    pagination?: boolean;
    filters?: boolean;
  };
  isSticky?: boolean;

  onChange?: (value: URLSearchParams) => void;
  onValueChange?: (filterValue: string) => void;
  hideFilters?: (filter: string) => boolean;

  searchInputProps?: Partial<SearchTextFieldProps>;
  actionProps?: { tooltip?: Omit<TooltipProps, 'children'>; button?: IconButtonProps; icon: SvgIconProps }[];
  paginationProps?: PaginationProps;
  popoverFilterProps?: PopoverChipProps[];
  extraFilterProps?: CustomChipProps[];
  endAdornment?: ReactNode;
};

const WrappedSearchHeader = ({
  children = null,
  params: paramsInit = '',
  paramKeys: {
    query: queryKey = 'query',
    offset: offsetKey = 'offset',
    rows: rowsKey = 'rows',
    filters: filtersKey = 'filters',
    track_total_hits: trackTotalHitsKey = 'track_total_hits'
  } = { query: 'query', offset: 'offset', rows: 'rows', filters: 'filters', track_total_hits: 'track_total_hits' },
  paramDefaults: {
    query: defaultQuery = '',
    offset: defaultOffset = 0,
    rows: defaultRows = 25,
    filters: defaultFilters = [],
    track_total_hits: defaultTrackTotalHits = TOTAL_TRACKED_RECORDS
  } = { query: '', offset: 0, rows: 25, filters: [], track_total_hits: TOTAL_TRACKED_RECORDS },
  loading = false,
  resultLabel = '',
  results = null,
  isSticky = false,
  disable: { count: disableCount = false, pagination: disablePagination = false, filters: disableFilters = false } = {
    count: false,
    pagination: false,
    filters: false
  },

  onChange = null,
  onValueChange = () => null,
  hideFilters = () => false,

  searchInputProps = null,
  actionProps = [],
  paginationProps = null,
  popoverFilterProps = [],
  extraFilterProps = [],
  endAdornment = null
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  const params = useMemo<URLSearchParams>(() => new URLSearchParams(paramsInit), [paramsInit]);

  const [queryValue, setQueryValue] = useState<string>(!params.has(queryKey) ? defaultQuery : params.get(queryKey));

  const rootRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filters = useMemo(() => params.getAll(filtersKey) || defaultFilters, [defaultFilters, filtersKey, params]);

  const offset = useMemo(() => {
    const val = Number(params.get(offsetKey));
    return isNaN(val) ? defaultOffset : val;
  }, [defaultOffset, offsetKey, params]);

  const rows = useMemo(() => {
    const val = Number(params.get(rowsKey));
    return isNaN(val) ? defaultRows : val;
  }, [defaultRows, params, rowsKey]);

  const trackTotalHits = useMemo(() => {
    const val = Number(params.get(trackTotalHitsKey));
    return isNaN(val) ? defaultTrackTotalHits : val;
  }, [defaultTrackTotalHits, params, trackTotalHitsKey]);

  const page = useMemo<number>(
    () => (!params ? null : Math.ceil(Math.min(offset, TOTAL_TRACKED_RECORDS) / rows) + 1),
    [offset, params, rows]
  );

  const count = useMemo<number>(
    () => (!results?.total ? null : Math.ceil(Math.min(results?.total, TOTAL_TRACKED_RECORDS) / rows)),
    [results?.total, rows]
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
    setQueryValue(defaultQuery);
    params.delete(queryKey);
    onChange(params);
  }, [defaultQuery, onChange, params, queryKey]);

  const handleQuerySubmit = useCallback(
    (value: string) => {
      params.set(queryKey, value);
      params.set(offsetKey, '0');
      onChange(params);
    },
    [params, queryKey, offsetKey, onChange]
  );

  const handleCountClick = useCallback(
    (value: number) => {
      params.set(trackTotalHitsKey, value.toString());
      onChange(params);
    },
    [onChange, params, trackTotalHitsKey]
  );

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, p: number) => {
      params.set(offsetKey, ((p - 1) * rows).toString());
      onChange(params);
    },
    [offsetKey, onChange, params, rows]
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
    setQueryValue(params.get(queryKey));
  }, [params, queryKey]);

  useEffect(() => {
    if (!loading) getInputEl().focus();
  }, [getInputEl, loading]);

  return (
    <PageHeader isSticky={isSticky}>
      <Root ref={rootRef}>
        <SearchWrapper ref={inputRef}>
          <SearchContainer>
            <div ref={inputRef} style={{ flex: 1 }}>
              <SearchTextField
                options={[]}
                {...searchInputProps}
                value={queryValue}
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
            {actionProps.length > 0 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  margin: `0 ${theme.spacing(0)}`,
                  [theme.breakpoints.up('md')]: {
                    margin: `0 ${theme.spacing(0.75)}`
                  }
                }}
              />
            )}
            {actionProps.map(({ tooltip, button, icon }, i) =>
              tooltip ? (
                <Tooltip key={`action-${i}`} {...tooltip}>
                  <div>
                    <IconButton size={!upMD ? 'small' : 'large'} {...button} disabled={loading}>
                      <SvgIcon fontSize={upMD ? 'medium' : 'small'} {...icon} />
                    </IconButton>
                  </div>
                </Tooltip>
              ) : (
                <IconButton key={`action-${i}`} size={!upMD ? 'small' : 'large'} disabled={loading} {...button} />
              )
            )}
            {endAdornment}
          </SearchContainer>

          {loading && (
            <LinearProgress
              sx={{
                flexBasis: '100%',
                height: theme.spacing(0.25),
                marginTop: theme.spacing(-0.25),
                width: '100%',
                borderRadius: '0 0 4px 4px',
                [theme.breakpoints.up('md')]: {
                  height: theme.spacing(0.5),
                  marginTop: theme.spacing(-0.5)
                }
              }}
            />
          )}
        </SearchWrapper>

        {/** Result Count */}
        {count > 1 ? (
          <>
            <Container style={{ justifyContent: 'flex-end', fontStyle: 'italic' }}>
              <div>
                {!disableCount && (
                  <SearchCount
                    loading={loading}
                    currentMax={trackTotalHits}
                    defaultMax={defaultTrackTotalHits}
                    suffix={resultLabel}
                    total={results?.total}
                    onClick={() =>
                      handleCountClick(
                        trackTotalHits !== MAX_TRACKED_RECORDS ? MAX_TRACKED_RECORDS : defaultTrackTotalHits
                      )
                    }
                  />
                )}
              </div>

              <div style={{ flexGrow: 1 }} />

              {/** Pagination */}
              {!disablePagination && page && (
                <Pagination
                  disabled={loading}
                  shape="rounded"
                  size="small"
                  sx={{
                    '.MuiPagination-ul': {
                      gap: theme.spacing(1)
                    }
                  }}
                  {...paginationProps}
                  count={count}
                  page={page}
                  onChange={handlePageChange}
                />
              )}
            </Container>
          </>
        ) : (
          <div />
        )}

        {/** Filters */}
        {!disableFilters && params && (
          <ChipList>
            {popoverFilterProps.map((props, i) => (
              <li key={`chip-${i}`} children={<PopoverChip {...props} />} />
            ))}

            {extraFilterProps.map((props, i) => (
              <li
                key={`chip-${i}`}
                children={
                  <CustomChip
                    size="small"
                    variant="outlined"
                    wrap
                    sx={{
                      marginBottom: theme.spacing(0.5),
                      marginRight: theme.spacing(1)
                    }}
                    {...props}
                  />
                }
              />
            ))}

            {filters
              .filter(f => !hideFilters(f))
              .map((f, i) => (
                <li key={`chiplist-${i}`}>
                  <CustomChip
                    label={f.startsWith('NOT(') && f.endsWith(')') ? f.substring(4, f.length - 1) : f}
                    color={f.startsWith('NOT(') && f.endsWith(')') ? 'error' : null}
                    size="small"
                    variant="outlined"
                    wrap
                    onClick={() => handleFilterClick(f)}
                    onDelete={() => handleFilterDelete(f)}
                    sx={{
                      marginBottom: theme.spacing(0.5),
                      marginRight: theme.spacing(1)
                    }}
                  />
                </li>
              ))}
          </ChipList>
        )}

        {/** Other Components */}
        {children && <Container>{children}</Container>}
      </Root>
    </PageHeader>
  );
};

export const SearchHeader = React.memo(WrappedSearchHeader);
export default SearchHeader;
