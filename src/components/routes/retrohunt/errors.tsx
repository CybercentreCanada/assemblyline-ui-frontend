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
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
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
import { useLocation, useNavigate } from 'react-router-dom';

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
  code?: string;
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

const WrappedRetrohuntErrors = ({ code = null, open = false, onClose = () => null }: Prop) => {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { setGlobalDrawer } = useDrawer();
  const { indexes } = useALContext();
  const { c12nDef, configuration } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [errors, setErrors] = useState<RetrohuntErrorResult>(null);
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [query, setQuery] = useState<SimpleSearchQuery>(new SimpleSearchQuery(DEFAULT_QUERY));

  const filterValue = useRef<string>('');
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
    if (code) reloadErrors(code, query.getDeltaString());
  }, [code, open, query, reloadErrors]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className={classes.dialogTitle}>
        <div className={classes.titleContainer}>
          <div>{t('errors.view.title')}</div>
          <Typography variant="caption" children={code} />
        </div>
        <div>
          <Tooltip title={'asd'}>
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
                      children={t('details.error')}
                      sortName="sort"
                      sortField="error"
                      disableNavigation={true}
                      onSort={(e, { name, field }) => handleQueryChange(name, field)}
                    />
                  </DivTableRow>
                </DivTableHead>
                <DivTableBody id="error-body">
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
