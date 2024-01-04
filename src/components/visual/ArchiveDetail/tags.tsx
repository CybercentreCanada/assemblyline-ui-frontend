import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Collapse, Divider, Paper, TableContainer, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useSafeResults from 'components/hooks/useSafeResults';
import ResultsTable, { ResultResult } from 'components/visual/SearchResult/results';
import Verdict from 'components/visual/Verdict';
import { safeFieldValue } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ActionMenu from '../ActionMenu';
import Classification from '../Classification';
import {
  GridLinkRow2,
  GridTable2,
  GridTableBody2,
  GridTableCell2,
  GridTableHead2,
  GridTableRow2,
  SortableGridHeaderCell2
} from '../GridTable';
import SimpleSearchQuery from '../SearchBar/simple-search-query';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  tooltip: {
    margin: 'auto !important'
  },

  container: {
    backgroundColor: theme.palette.background.default,
    border: `solid 1px ${theme.palette.divider}`,
    borderRadius: '4px',
    width: '100%',
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  caption: {
    display: 'grid',
    gridTemplateRows: 'repeat(2, 1fr)',
    gridTemplateColumns: '1fr auto',
    marginBottom: theme.spacing(1),
    borderRadius: '4px 4px 0px 0px',
    '&>div': {
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  },
  tablecontainer: {
    fontSize: '90%',
    maxWidth: '100%'
  },
  table: {
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  headcell: {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    padding: '6px 16px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgb(46, 46, 46)' : '#EEE',
    '@media print': {
      color: 'black',
      backgroundColor: '#DDD !important'
    }
  },
  tablerow: {
    textDecoration: 'none',
    '&:nth-of-type(odd)': {
      '@media print': {
        backgroundColor: '#EEE !important'
      },
      backgroundColor: theme.palette.mode === 'dark' ? '#ffffff08' : '#00000008'
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  bodycell: {
    '@media print': {
      color: 'black'
    },
    fontSize: 'inherit',
    lineHeight: 'inherit',
    padding: `0px ${theme.spacing(2)}`
  },
  sp2: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  muted: {
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
}));

export type Signature = [string, string, boolean]; // [name, h_type, safelisted]

export type Tag = [string, string, boolean, string]; // [value, h_type, safelisted, classification]

type Result = {
  tag_type: string;
  value: string;
  h_type: string;
  safelisted: boolean;
  classification: string;
};

type ArchivedTagSectionProps = {
  sha256: string;
  signatures: Signature[];
  tags: Record<string, Tag[]>;
  force?: boolean;
  drawer?: boolean;
};

const WrappedArchivedTagSection: React.FC<ArchivedTagSectionProps> = ({
  sha256,
  signatures,
  tags,
  force = false,
  drawer = true
}) => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const sp2 = theme.spacing(2);
  const { showSafeResults } = useSafeResults();

  const [results, setResults] = useState<Result[]>(null);
  const [tagUnsafeMap, setTagUnsafeMap] = useState<any>({});
  const [open, setOpen] = useState<boolean>(true);
  const [query, setQuery] = useState<SimpleSearchQuery>(new SimpleSearchQuery(''));

  // const sortRef = useRef<keyof Result>(null);
  // const dirRef = useRef<'ASC' | 'DESC'>(null);

  useEffect(() => {
    if (tags) {
      const newTagUnsafeMap = {};
      for (const tType of Object.keys(tags)) {
        newTagUnsafeMap[tType] = tags[tType].some(i => i[1] !== 'safe' && !i[2]);
      }
      setTagUnsafeMap(newTagUnsafeMap);
    }
  }, [tags]);

  const someSigNotSafe = signatures && signatures.some(i => i[1] !== 'safe' && !i[2]);
  const forceShowSig = signatures && signatures.length !== 0 && (showSafeResults || force);
  const someTagNotSafe = Object.values(tagUnsafeMap).some(Boolean);
  const forceShowTag = Object.keys(tagUnsafeMap).length !== 0 && (showSafeResults || force);

  // const onResultsSort = useCallback((key: keyof Result, defaultDir: 'ASC' | 'DESC' = 'ASC') => {
  //   dirRef.current = sortRef.current !== key ? defaultDir : dirRef.current === 'DESC' ? 'ASC' : 'DESC';
  //   sortRef.current = key;

  //   setResults(r => [
  //     ...r.sort((a, b) =>
  //       dirRef.current === 'ASC'
  //         ? (a[key] as any).localeCompare(b[key] as any)
  //         : (b[key] as any).localeCompare(a[key] as any)
  //     )
  //   ]);
  // }, []);

  const onSortResults = useCallback((event: any, { field }: { field: string }) => {
    // dirRef.current = sortRef.current !== key ? defaultDir : dirRef.current === 'DESC' ? 'ASC' : 'DESC';
    // sortRef.current = key;

    // setResults(r => [
    //   ...r.sort((a, b) =>
    //     dirRef.current === 'ASC'
    //       ? (a[key] as any).localeCompare(b[key] as any)
    //       : (b[key] as any).localeCompare(a[key] as any)
    //   )
    // ]);

    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), '');
      q.set('sort', field);
      return q;
    });
  }, []);

  useEffect(() => {
    const signatureResults = !signatures
      ? []
      : signatures.map(item => ({
          tag_type: 'heuristic.signature',
          value: item[0],
          h_type: item[1],
          safelisted: item[2],
          classification: ''
        }));

    const tagResults = !tags
      ? []
      : Object.entries(tags).flatMap(([tagType, items]) =>
          items.map(item => ({
            tag_type: tagType,
            value: item[0],
            h_type: item[1],
            safelisted: item[2],
            classification: item[3]
          }))
        );

    const sort = new SimpleSearchQuery(query.toString(), null).get('sort', 'tag_type asc');
    const dir = sort && sort.indexOf('asc') !== -1 ? 'asc' : 'desc';
    const field = sort.replace(' asc', '').replace(' desc', '') as keyof Result;

    setResults(
      [...signatureResults, ...tagResults].sort((a, b) =>
        !(field in a)
          ? 0
          : dir === 'asc'
          ? (a[field] as any).localeCompare(b[field] as any)
          : (b[field] as any).localeCompare(a[field] as any)
      )
    );
  }, [query, signatures, tags]);

  return (!signatures && !tags) || someTagNotSafe || forceShowTag || someSigNotSafe || forceShowSig ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} className={classes.title}>
        <span>{t('tags')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {results && (
            <TableContainer
              component={props =>
                drawer ? (
                  <Paper sx={{ backgroundColor: theme.palette.background.default }} {...props} />
                ) : (
                  <Paper {...props} />
                )
              }
            >
              <GridTable2 columns={5} size="small">
                <GridTableHead2>
                  <GridTableRow2>
                    <SortableGridHeaderCell2
                      allowSort
                      children={t('type')}
                      query={query}
                      sortField="tag_type"
                      onSort={onSortResults}
                    />
                    <SortableGridHeaderCell2
                      allowSort
                      children={t('verdict')}
                      query={query}
                      sortField="h_type"
                      onSort={onSortResults}
                    />
                    <SortableGridHeaderCell2
                      allowSort
                      children={t('value')}
                      query={query}
                      sortField="value"
                      onSort={onSortResults}
                    />
                    <SortableGridHeaderCell2
                      allowSort
                      children={t('classification')}
                      query={query}
                      sortField="classification"
                      onSort={onSortResults}
                    />
                    <GridTableCell2 />
                  </GridTableRow2>
                </GridTableHead2>
                <GridTableBody2>
                  {results.map(({ tag_type, value, h_type, safelisted, classification }, i) => (
                    <Row
                      key={`${tag_type}-${value}-${h_type}-${safelisted}-${classification}`}
                      tag_type={tag_type}
                      value={value}
                      h_type={h_type}
                      safelisted={safelisted}
                      classification={classification}
                      sha256={sha256}
                      force={force}
                    />
                  ))}
                </GridTableBody2>
              </GridTable2>
            </TableContainer>
          )}
        </div>
      </Collapse>
    </div>
  ) : null;
};

type RowProps = {
  tag_type: string;
  value: string;
  h_type: string;
  safelisted: boolean;
  classification: string;
  sha256: string;
  force: boolean;
};

const initialMenuState = {
  mouseX: null,
  mouseY: null
};

const WrappedRow: React.FC<RowProps> = ({ tag_type, value, h_type, safelisted, classification, sha256, force }) => {
  const theme = useTheme();
  const location = useLocation();

  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const [resultResults, setResultResults] = useState<{
    items: ResultResult[];
    offset: number;
    rows: number;
    total: number;
  }>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [state, setState] = useState(initialMenuState);

  useEffect(() => {
    if (!sha256 || !tag_type || !value || !open) return;
    apiCall({
      method: 'POST',
      url: `/api/v4/search/result/`,
      body: {
        query: `result.sections.tags.${tag_type}:${safeFieldValue(value)}`,
        rows: 10,
        offset: 0,
        filters: [`NOT(sha256:${sha256})`]
      },
      onSuccess: api_data => setResultResults(api_data.api_response),
      onFailure: api_data => showErrorMessage(api_data.api_error_message)
    });
    // eslint-disable-next-line
  }, [open, sha256, tag_type, value]);

  const handleRowClick = useCallback((event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(v => !v);
  }, []);

  const handleMenuClick = useCallback((event: React.MouseEvent<any>) => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  return (
    <>
      <ActionMenu
        category={'tag'}
        type={tag_type}
        value={value}
        state={state}
        setState={setState}
        classification={classification}
      />
      <GridLinkRow2
        hover
        to={`/search/result?query=result.sections.tags.${tag_type}:%22WARZONE%22#${location.hash}`}
        onClick={handleRowClick}
        onContextMenu={handleMenuClick}
      >
        <GridTableCell2 children={tag_type} />
        <GridTableCell2 children={<Verdict verdict={h_type as any} fullWidth />} />
        <GridTableCell2 breakable children={value} />
        <GridTableCell2 children={<Classification type="text" size="tiny" c12n={classification} format="short" />} />
        <GridTableCell2 sx={{ textAlign: 'right' }}>
          {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </GridTableCell2>
      </GridLinkRow2>

      <GridTableRow2>
        <GridTableCell2 sx={{ gridColumn: 'span 5', padding: 0 }}>
          <Collapse in={open} timeout="auto">
            <div style={{ paddingTop: theme.spacing(2), paddingBottom: theme.spacing(2) }}>
              <ResultsTable component={other => <Paper {...other} />} resultResults={resultResults} allowSort={false} />
            </div>
          </Collapse>
        </GridTableCell2>
      </GridTableRow2>
    </>
  );
};

const Row = React.memo(WrappedRow);

export const ArchivedTagSection = React.memo(WrappedArchivedTagSection);
export default ArchivedTagSection;
