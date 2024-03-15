import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  AlertTitle,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import { RetrohuntResult } from 'components/routes/retrohunt';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    display: 'flex',
    flexDirection: 'row'
  },
  titleContainer: {
    flex: 1
  },
  pagination: {
    justifyContent: 'center'
  },
  searchBar: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  title: {
    fontWeight: 500,
    marginRight: theme.spacing(0.5),
    display: 'flex'
  },
  skeletonButton: {
    height: '2.5rem',
    width: '2.5rem',
    margin: theme.spacing(0.5)
  }
}));

const PAGE_SIZE = 20;

const MAX_TRACKED_RECORDS = 10000;

const RELOAD_DELAY = 5000;

const DEFAULT_PARAMS: object = {
  offset: 0,
  rows: PAGE_SIZE,
  sort: null
};

type Error = {
  type: 'warning' | 'error';
  message: string;
};

type RetrohuntErrorResult = {
  items: Error[];
  offset: number;
  rows: number;
  total: number;
};

type Props = {
  retrohunt: RetrohuntResult;
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

const WrappedRetrohuntErrors = ({ retrohunt = null }: Props) => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { configuration } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [errorResults, setErrorResults] = useState<RetrohuntErrorResult>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [query, setQuery] = useState<SimpleSearchQuery>(new SimpleSearchQuery(DEFAULT_QUERY));

  const timer = useRef<boolean>(false);

  const totals = useMemo<string>(() => {
    if (!retrohunt) return null;
    const warnings =
      !retrohunt?.total_warnings || retrohunt?.total_warnings === 0
        ? null
        : retrohunt?.total_warnings === 1
        ? `1 ${t('warning')}`
        : `${retrohunt?.total_warnings} ${t('warnings')}`;

    const errors =
      !retrohunt?.total_errors || retrohunt?.total_errors === 0
        ? null
        : retrohunt?.total_errors === 1
        ? `1 ${t('error')}`
        : `${retrohunt?.total_errors} ${t('errors')}`;

    return warnings && errors ? `${warnings} ${t('and')} ${errors}` : warnings ? warnings : errors ? errors : null;
  }, [retrohunt, t]);

  const pageCount = useMemo<number>(
    () =>
      errorResults && 'total' in errorResults
        ? Math.ceil(Math.min(errorResults.total, MAX_TRACKED_RECORDS) / PAGE_SIZE)
        : 0,
    [errorResults]
  );

  const reloadErrors = useCallback(
    (curKey: string, searchParam: string) => {
      if (currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        const curQuery = new SimpleSearchQuery(searchParam, DEFAULT_QUERY);
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/errors/${curKey}/`,
          body: curQuery.getParams(),
          onSuccess: api_data => setErrorResults(api_data.api_response),
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?.roles]
  );

  const handleQueryChange = useCallback((key: string, value: string | number) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      q.set(key, value);
      return q;
    });
  }, []);

  useEffect(() => {
    if (open && retrohunt && 'key' in retrohunt) reloadErrors(retrohunt.key, query.getDeltaString());
  }, [open, query, reloadErrors, retrohunt]);

  useEffect(() => {
    if (!timer.current && open && retrohunt && 'finished' in retrohunt && !retrohunt.finished) {
      timer.current = true;
      setTimeout(() => {
        reloadErrors(retrohunt.key, query.toString());
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [open, query, reloadErrors, retrohunt]);

  return (
    <>
      {!retrohunt ? (
        <Grid item>
          <Skeleton className={classes.skeletonButton} variant="circular" />
        </Grid>
      ) : (
        totals && (
          <Grid item>
            <Tooltip title={totals}>
              <IconButton
                size="large"
                onClick={() => setOpen(true)}
                style={{ color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark }}
              >
                <ErrorOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        )
      )}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.titleContainer}>
            <div>{t('errors.view.title')}</div>
          </div>
          <div>
            <Tooltip title={t('errors.close')}>
              <div>
                <IconButton onClick={() => setOpen(false)}>
                  <CloseOutlinedIcon />
                </IconButton>
              </div>
            </Tooltip>
          </div>
        </DialogTitle>
        <DialogContent>
          {!errorResults ? (
            <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
          ) : !('total' in errorResults) || errorResults.total === 0 ? (
            <div style={{ width: '100%' }}>
              <InformativeAlert>
                <AlertTitle>{t('no_results_title')}</AlertTitle>
                {t('no_results_desc')}
              </InformativeAlert>
            </div>
          ) : (
            <>
              <div className={classes.searchBar}>
                {totals && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {totals}
                  </Typography>
                )}
                {pageCount > 1 && (
                  <Pagination
                    page={Math.ceil(1 + query.get('offset') / PAGE_SIZE)}
                    onChange={(e, value) => handleQueryChange('offset', (value - 1) * PAGE_SIZE)}
                    count={pageCount}
                    shape="rounded"
                    size="small"
                    classes={{
                      ul: classes.pagination
                    }}
                  />
                )}
              </div>
              <div style={{ height: '4px' }}>{isReloading && <LinearProgress />}</div>
              <TableContainer component={Paper}>
                <DivTable>
                  <DivTableHead>
                    <DivTableRow>
                      <SortableHeaderCell
                        query={query}
                        children={t('details.type')}
                        sortName="sort"
                        sortField="type"
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.message')}
                        sortName="sort"
                        sortField="message"
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                      />
                    </DivTableRow>
                  </DivTableHead>
                  <DivTableBody>
                    {errorResults.items.map((error, id) => (
                      <DivTableRow key={id} hover style={{ textDecoration: 'none' }}>
                        {error.type === 'warning' ? (
                          <DivTableCell style={{ paddingLeft: theme.spacing(2) }}>
                            <WarningAmberOutlinedIcon color="warning" />
                          </DivTableCell>
                        ) : error.type === 'error' ? (
                          <DivTableCell style={{ paddingLeft: theme.spacing(2) }}>
                            <ErrorOutlineOutlinedIcon color="error" />
                          </DivTableCell>
                        ) : (
                          <DivTableCell></DivTableCell>
                        )}
                        <DivTableCell>{error.message}</DivTableCell>
                      </DivTableRow>
                    ))}
                  </DivTableBody>
                </DivTable>
              </TableContainer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export const RetrohuntErrors = React.memo(WrappedRetrohuntErrors);
export default RetrohuntErrors;
