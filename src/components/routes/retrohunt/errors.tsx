import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {
  AlertTitle,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Tooltip
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
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
  }
}));

type RetrohuntErrorResult = {
  items: string[];
  offset: number;
  rows: number;
  total: number;
};

type Prop = {
  retrohunt?: RetrohuntResult;
  open?: boolean;
  onClose?: () => void;
};

const PAGE_SIZE = 20;

const MAX_TRACKED_RECORDS = 10000;

const RELOAD_DELAY = 5000;

const DEFAULT_PARAMS: object = {
  offset: 0,
  rows: PAGE_SIZE,
  sort: null
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

const WrappedRetrohuntErrors = ({ retrohunt = null, open = false, onClose = () => null }: Prop) => {
  const { t } = useTranslation(['retrohunt']);
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [errors, setErrors] = useState<RetrohuntErrorResult>(null);
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [query, setQuery] = useState<SimpleSearchQuery>(new SimpleSearchQuery(DEFAULT_QUERY));

  const timer = useRef<boolean>(false);

  const errorPageCount = useMemo<number>(
    () => (errors && 'total' in errors ? Math.ceil(Math.min(errors.total, MAX_TRACKED_RECORDS) / PAGE_SIZE) : 0),
    [errors]
  );

  const reloadErrors = useCallback(
    (curCode: string, searchParam: string) => {
      if (currentUser.roles.includes('retrohunt_view')) {
        const curQuery = new SimpleSearchQuery(searchParam, DEFAULT_QUERY);
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/errors/${curCode}/`,
          body: curQuery.getParams(),
          onSuccess: api_data => setErrors(api_data.api_response),
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  const handleQueryChange = useCallback((key: string, value: string | number) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      q.set(key, value);
      return q;
    });
  }, []);

  useEffect(() => {
    if (retrohunt && 'code' in retrohunt) reloadErrors(retrohunt.code, query.getDeltaString());
  }, [query, reloadErrors, retrohunt]);

  useEffect(() => {
    if (!timer.current && retrohunt && 'finished' in retrohunt && !retrohunt.finished) {
      timer.current = true;
      setTimeout(() => {
        reloadErrors(retrohunt.code, query.toString());
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [query, reloadErrors, retrohunt]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className={classes.dialogTitle}>
        <div className={classes.titleContainer}>
          <div>
            {retrohunt && 'total_errors' in retrohunt
              ? retrohunt?.total_errors > 1
                ? `${retrohunt?.total_errors} ${t('errors.totals')}`
                : `${retrohunt?.total_errors} ${t('errors.total')}`
              : t('errors.view.title')}
          </div>
        </div>
        <div>
          <Tooltip title={t('errors.close')}>
            <div>
              <IconButton onClick={onClose}>
                <CloseOutlinedIcon />
              </IconButton>
            </div>
          </Tooltip>
        </div>
      </DialogTitle>
      <DialogContent>
        {!errors ? (
          <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
        ) : !('total' in errors) || errors.total === 0 ? (
          <div style={{ width: '100%' }}>
            <InformativeAlert>
              <AlertTitle>{t('no_results_title')}</AlertTitle>
              {t('no_results_desc')}
            </InformativeAlert>
          </div>
        ) : (
          <>
            {errorPageCount > 1 && (
              <Pagination
                page={Math.ceil(1 + query.get('offset') / PAGE_SIZE)}
                onChange={(e, value) => handleQueryChange('offset', (value - 1) * PAGE_SIZE)}
                count={errorPageCount}
                shape="rounded"
                size="small"
                classes={{
                  ul: classes.pagination
                }}
              />
            )}
            <div style={{ height: '4px' }}>{isReloading && <LinearProgress />}</div>
            <TableContainer component={Paper}>
              <DivTable>
                <DivTableHead>
                  <DivTableRow>
                    <SortableHeaderCell
                      query={query}
                      children={t('details.message')}
                      sortName="sort"
                      sortField="error"
                      disableNavigation={true}
                      onSort={(e, { name, field }) => handleQueryChange(name, field)}
                    />
                  </DivTableRow>
                </DivTableHead>
                <DivTableBody>
                  {errors.items.map((error, id) => (
                    <DivTableRow key={id} hover style={{ textDecoration: 'none' }}>
                      <DivTableCell>{error}</DivTableCell>
                    </DivTableRow>
                  ))}
                </DivTableBody>
              </DivTable>
            </TableContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const RetrohuntErrors = React.memo(WrappedRetrohuntErrors);
export default RetrohuntErrors;
