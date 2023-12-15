import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Collapse, Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import useSafeResults from 'components/hooks/useSafeResults';
import ResultsTable, { ResultResult } from 'components/visual/SearchResult/results';
import Verdict from 'components/visual/Verdict';
import { safeFieldValue } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ActionMenu from '../ActionMenu';
import Classification from '../Classification';
import { GridTable, GridTableBody, GridTableCell, GridTableHead, GridTableHeader, GridTableRow } from '../GridTable';

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
  type: string;
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

  const sortRef = useRef<keyof Result>(null);
  const dirRef = useRef<'ASC' | 'DESC'>(null);

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

  const onResultsSort = useCallback((key: keyof Result, defaultDir: 'ASC' | 'DESC' = 'ASC') => {
    dirRef.current = sortRef.current !== key ? defaultDir : dirRef.current === 'DESC' ? 'ASC' : 'DESC';
    sortRef.current = key;

    setResults(r => [
      ...r.sort((a, b) =>
        dirRef.current === 'ASC'
          ? (a[key] as any).localeCompare(b[key] as any)
          : (b[key] as any).localeCompare(a[key] as any)
      )
    ]);
  }, []);

  useEffect(() => {
    const signatureResults = !signatures
      ? []
      : signatures.map(item => ({
          type: 'heuristic.signature',
          value: item[0],
          h_type: item[1],
          safelisted: item[2],
          classification: ''
        }));

    const tagResults = !tags
      ? []
      : Object.entries(tags).flatMap(([tagType, items]) =>
          items.map(item => ({
            type: tagType,
            value: item[0],
            h_type: item[1],
            safelisted: item[2],
            classification: item[3]
          }))
        );

    setResults([...signatureResults, ...tagResults]);
  }, [signatures, tags]);

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
            <GridTable nbOfColumns={5} sx={{ backgroundColor: theme.palette.background.default }}>
              <GridTableHead>
                <GridTableRow>
                  <GridTableHeader
                    allowSort
                    sortField="tag_type"
                    onSort={() => onResultsSort('type', 'ASC')}
                    style={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgb(46, 46, 46)' : 'rgb(64, 64, 64)' }}
                  >
                    {t('type')}
                  </GridTableHeader>
                  <GridTableHeader
                    allowSort
                    sortField="h_type"
                    onSort={() => onResultsSort('h_type', 'ASC')}
                    style={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgb(46, 46, 46)' : 'rgb(64, 64, 64)' }}
                  >
                    {t('verdict')}
                  </GridTableHeader>
                  <GridTableHeader
                    allowSort
                    sortField="value"
                    onSort={() => onResultsSort('value', 'ASC')}
                    style={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgb(46, 46, 46)' : 'rgb(64, 64, 64)' }}
                  >
                    {t('value')}
                  </GridTableHeader>
                  <GridTableHeader
                    allowSort
                    sortField="classification"
                    onSort={() => onResultsSort('classification', 'ASC')}
                    style={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgb(46, 46, 46)' : 'rgb(64, 64, 64)' }}
                  >
                    {t('classification')}
                  </GridTableHeader>
                  <GridTableHeader
                    style={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgb(46, 46, 46)' : 'rgb(64, 64, 64)' }}
                  />
                </GridTableRow>
              </GridTableHead>
              <GridTableBody>
                {results.map(({ type, value, h_type, safelisted, classification }, i) => (
                  <Row
                    key={`${type}-${value}-${h_type}-${safelisted}-${classification}`}
                    tag_type={type}
                    value={value}
                    h_type={h_type}
                    safelisted={safelisted}
                    classification={classification}
                    sha256={sha256}
                    force={force}
                  />
                ))}
              </GridTableBody>
            </GridTable>
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
      <GridTableRow
        link
        hover
        to={`/search/result?query=result.sections.tags.${tag_type}:%22WARZONE%22#${location.hash}`}
        onClick={handleRowClick}
        onContextMenu={handleMenuClick}
      >
        <GridTableCell children={tag_type} />
        <GridTableCell children={<Verdict verdict={h_type as any} fullWidth />} />
        <GridTableCell wrap sx={{ wordWrap: 'break-word' }} children={value} />
        <GridTableCell children={<Classification type="text" size="tiny" c12n={classification} format="short" />} />
        <GridTableCell sx={{ textAlign: 'right' }}>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </GridTableCell>
      </GridTableRow>

      <GridTableRow>
        <GridTableCell sx={{ gridColumn: 'span 5', padding: 0 }}>
          <Collapse in={open} timeout="auto">
            <div style={{ paddingTop: theme.spacing(2), paddingBottom: theme.spacing(2) }}>
              <ResultsTable resultResults={resultResults} allowSort={false} />
            </div>
          </Collapse>
        </GridTableCell>
      </GridTableRow>
    </>
  );
};

const Row = React.memo(WrappedRow);

export const ArchivedTagSection = React.memo(WrappedArchivedTagSection);
export default ArchivedTagSection;
