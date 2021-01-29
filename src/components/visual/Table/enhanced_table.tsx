import { InputBase } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { createStyles, fade, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import FilterListIcon from '@material-ui/icons/FilterList';
import React from 'react';
import { useTranslation } from 'react-i18next';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

export interface Cell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
}

const useHeaderStyles = makeStyles((theme: Theme) =>
  createStyles({
    dense: {
      whiteSpace: 'nowrap',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5)
    },
    big: {
      whiteSpace: 'nowrap'
    }
  })
);

interface EnhancedTableHeadProps {
  cells: Cell[];
  dense?: boolean;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
}

const WrappedEnhancedTableHead: React.FC<EnhancedTableHeadProps> = ({
  cells,
  dense = false,
  order,
  orderBy,
  onRequestSort
}) => {
  const classes = useHeaderStyles();
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {cells.map(cell => (
          <TableCell
            key={cell.id}
            className={dense ? classes.dense : classes.big}
            align={cell.numeric ? 'right' : 'left'}
            padding={cell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === cell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === cell.id}
              direction={orderBy === cell.id ? order : 'asc'}
              onClick={createSortHandler(cell.id)}
            >
              {cell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1)
    },
    flexItem: {
      flex: '1 1 100%'
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.text.primary, 0.04),
      '&:hover': {
        backgroundColor: fade(theme.palette.text.primary, 0.06)
      },
      width: 300
    },
    searchIcon: {
      padding: theme.spacing(0, 1),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center'
    },
    inputRoot: {
      color: 'inherit',
      width: '100%'
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(3)}px)`,
      width: '100%'
    }
  })
);

interface EnhancedTableToolbarProps {
  count: number;
  rowsPerPage: number;
  page: number;
  filter: string;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilter: (event) => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { count, rowsPerPage, page, filter, handleChangePage, handleChangeRowsPerPage, handleFilter } = props;
  const { t } = useTranslation();
  const classes = useToolbarStyles();

  return (
    <Toolbar className={classes.root}>
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <FilterListIcon />
        </div>
        <InputBase
          onChange={handleFilter}
          placeholder={t('filter')}
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput
          }}
          value={filter}
        />
      </div>

      <TablePagination
        className={classes.flexItem}
        rowsPerPageOptions={[15, 25, 50, 100]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Toolbar>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2)
    },
    table: {
      minWidth: 750
    },
    dense: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5)
    }
  })
);

interface EnhancedTableProps {
  cells: Cell[];
  rows: any[];
  onClick?: (row: any) => void;
  defaultOrderBy?: string;
  defaultOrderDirection?: Order;
  dense?: boolean;
  showEmpty?: boolean;
}

const WrappedEnhancedTable: React.FC<EnhancedTableProps> = ({
  cells,
  rows,
  onClick = null,
  dense = false,
  defaultOrderBy = 'name',
  defaultOrderDirection = 'asc',
  showEmpty = false
}) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>(defaultOrderDirection);
  const [orderBy, setOrderBy] = React.useState<string>(defaultOrderBy);
  const [page, setPage] = React.useState(0);
  const [filter, setFilter] = React.useState('');
  const [rowsPerPage, setRowsPerPage] = React.useState(15);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          filter={filter}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleFilter={event => setFilter(event.target.value)}
        />
        <TableContainer style={{ paddingLeft: '8px', paddingRight: '8px' }}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              dense={dense}
              cells={cells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow hover onClick={onClick ? () => onClick(row) : null} tabIndex={-1} key={index}>
                      {cells.map(head => {
                        return (
                          <TableCell
                            key={head.id}
                            className={dense ? classes.dense : null}
                            align={head.numeric ? 'right' : 'inherit'}
                          >
                            {`${row[head.id]}`}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              {showEmpty && emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 45 : 53) * emptyRows }}>
                  <TableCell colSpan={cells.length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

const EnhancedTableHead = React.memo(WrappedEnhancedTableHead);
const EnhancedTable = React.memo(WrappedEnhancedTable);
export default EnhancedTable;
