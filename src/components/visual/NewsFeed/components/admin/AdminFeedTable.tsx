import { createStyles, makeStyles, TableCell, TableSortLabel, Theme, useTheme, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow } from 'components/visual/DivTable';
import 'moment-timezone';
import 'moment/locale/fr';
import { default as React, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useHistory, useLocation } from 'react-router-dom';
import { useNewsFeed } from '../..';
import InformativeAlert from '../../../InformativeAlert';

export type UserResult = {
  classification: string;
  email: string;
  groups: string[];
  id: string;
  is_active: boolean;
  name: string;
  type: string[];
  uname: string;
};

type SearchResults = {
  items: UserResult[];
  rows: number;
  offset: number;
  total: number;
};

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1)
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

export const SortableHeaderCell = ({ children, sortField, allowSort = true, ...other }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const curSort = searchParams.get('sort');
  const history = useHistory();
  const active = curSort && curSort.indexOf(sortField) !== -1;
  const dir = active && curSort.indexOf('asc') !== -1 ? 'asc' : 'desc';

  const triggerSort = () => {
    if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf('asc') === -1) {
      searchParams.set('sort', `${sortField} asc`);
    } else {
      searchParams.set('sort', `${sortField} desc`);
    }
    history.push(`${location.pathname}?${searchParams.toString()}`);
  };
  return (
    <StyledTableCell {...other} component="div">
      {allowSort ? (
        <TableSortLabel active={active} direction={dir} onClick={triggerSort}>
          {children}
        </TableSortLabel>
      ) : (
        children
      )}
    </StyledTableCell>
  );
};

type UsersTableProps = {
  userResults: SearchResults;
  onRowClick: (index: number) => void;
};

const useStyles = makeStyles(theme => ({
  divTableCell: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '20px'
  },
  primary: {
    color: theme.palette.primary.main
  },
  error: {
    color: theme.palette.error.main
  }
}));

const WrappedAdminFeedTable: React.FC<UsersTableProps> = ({ userResults, onRowClick = () => null }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useTranslation(['adminFeeds']);
  const { feeds } = useNewsFeed();

  const onLaunch = useCallback(
    (index: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
    },
    []
  );

  const onDelete = useCallback(
    (index: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
    },
    []
  );

  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }

  const rows = [
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Donut', 452, 25.0, 51, 4.9),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
    createData('Honeycomb', 408, 3.2, 87, 6.5),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Jelly Bean', 375, 0.0, 94, 0.0),
    createData('KitKat', 518, 26.0, 65, 7.0),
    createData('Lollipop', 392, 0.2, 98, 0.0),
    createData('Marshmallow', 318, 0, 81, 2.0),
    createData('Nougat', 360, 19.0, 9, 37.0),
    createData('Oreo', 437, 18.0, 63, 4.0)
  ];

  const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Dessert (100g serving)' },
    { id: 'calories', numeric: true, disablePadding: false, label: 'Calories' },
    { id: 'fat', numeric: true, disablePadding: false, label: 'Fat (g)' },
    { id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)' },
    { id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)' }
  ];

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  }

  return feeds ? (
    feeds.length !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable size="small">
          <DivTableHead>
            <DivTableRow style={{ whiteSpace: 'nowrap' }}>
              <SortableHeaderCell sortField="lastBuildDate">{t('table.lastBuildDate')}</SortableHeaderCell>
              <SortableHeaderCell sortField="title">{t('table.title')}</SortableHeaderCell>
              <SortableHeaderCell sortField="description">{t('table.description')}</SortableHeaderCell>
              <SortableHeaderCell sortField="language">{t('table.language')}</SortableHeaderCell>
              <SortableHeaderCell sortField="items">{t('table.items')}</SortableHeaderCell>
              <SortableHeaderCell sortField="url">{t('table.url')}</SortableHeaderCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {feeds.map((feed, i) => (
              <DivTableRow
                key={feed.metadata.url + '-' + i}
                hover
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                onClick={e => onRowClick(i)}
              >
                <DivTableCell>
                  <Moment date={feed.channel.lastBuildDate} fromNow ago />
                </DivTableCell>
                <DivTableCell>{feed.channel.title}</DivTableCell>
                <DivTableCell>{feed.channel.description}</DivTableCell>
                <DivTableCell>{feed.channel.language}</DivTableCell>
                {/* <DivTableCell>{moment().from(feed.lastBuildDate)}</DivTableCell> */}
                <DivTableCell>{feed.items.length}</DivTableCell>
                <DivTableCell>{feed.metadata.url}</DivTableCell>
              </DivTableRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_feeds_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

export const AdminFeedTable = React.memo(WrappedAdminFeedTable);
export default AdminFeedTable;
