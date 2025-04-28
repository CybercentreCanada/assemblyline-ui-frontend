import FilterListIcon from '@mui/icons-material/FilterList';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Box, Grid, IconButton, InputBase, TablePagination, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import { alpha, useTheme } from '@mui/material/styles';
import Throttler from 'commons/addons/utils/throttler';
import PageHeader from 'commons/components/pages/PageHeader';
import Classification from 'components/visual/Classification';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from 'components/visual/DivTable';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

const throttler = new Throttler(250);

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
): (a: Record<Key, number | string>, b: Record<Key, number | string>) => number {
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
  break: boolean;
  numeric: boolean;
}

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
  const theme = useTheme();
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <DivTableHead>
      <DivTableRow>
        {cells.map(cell => (
          <DivTableCell
            key={cell.id}
            align={cell.numeric ? 'right' : 'left'}
            padding={cell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === cell.id ? order : false}
            sx={{
              ...(!dense && {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
                paddingTop: theme.spacing(1.5),
                paddingBottom: theme.spacing(1.5)
              })
            }}
          >
            <TableSortLabel
              active={orderBy === cell.id}
              direction={orderBy === cell.id ? order : 'asc'}
              onClick={createSortHandler(cell.id)}
            >
              {cell.label}
            </TableSortLabel>
          </DivTableCell>
        ))}
      </DivTableRow>
    </DivTableHead>
  );
};

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { t } = useTranslation();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div style={{ flexShrink: 0, marginLeft: '20px' }}>
      <Tooltip title={t('pager.first')}>
        <span>
          <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} size="large">
            <FirstPageIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('pager.back')}>
        <span>
          <IconButton onClick={handleBackButtonClick} disabled={page === 0} size="large">
            <KeyboardArrowLeft />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('pager.next')}>
        <span>
          <IconButton
            onClick={handleNextButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            size="large"
          >
            <KeyboardArrowRight />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('pager.last')}>
        <span>
          <IconButton
            onClick={handleLastPageButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            size="large"
          >
            <LastPageIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
}

interface EnhancedTableToolbarProps {
  itemCount: number;
  rowsPerPage: number;
  page: number;
  filter: string;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilter: (event) => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { itemCount, rowsPerPage, page, filter, handleChangePage, handleChangeRowsPerPage, handleFilter } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <PageHeader isSticky>
      <Grid container size="grow">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              position: 'relative',
              alignSelf: 'center',
              borderRadius: theme.shape.borderRadius,
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.06)
              },
              height: 'fit-content',
              marginTop: theme.spacing(1),
              width: 300,
              [theme.breakpoints.only('xs')]: {
                width: '100%'
              }
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 1),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FilterListIcon />
            </Box>
            <InputBase
              onChange={event => handleFilter(event.target.value)}
              placeholder={t('filter')}
              value={filter}
              slotProps={{
                root: {
                  sx: {
                    color: 'inherit',
                    width: '100%'
                  }
                },
                input: {
                  sx: {
                    padding: theme.spacing(1, 1, 1, 0),
                    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
                    width: '100%'
                  }
                }
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TablePagination
            labelRowsPerPage={t('pager.rows')}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} ${t('pager.of')} ${count !== -1 ? count : `${t('pager.more')} ${to}`}`
            }
            component="div"
            count={itemCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
            sx={{ flex: '1 1 100%' }}
          />
        </Grid>
      </Grid>
    </PageHeader>
  );
};

interface EnhancedTableBodyProps {
  cells: Cell[];
  rows: any[];
  rowsPerPage: number;
  page: number;
  linkField?: string;
  linkPrefix?: string;
  onClick?: (row: any) => void;
  defaultOrderBy?: string;
  defaultOrderDirection?: Order;
  dense?: boolean;
  showEmpty?: boolean;
}

const WrappedEnhancedTableBody: React.FC<EnhancedTableBodyProps> = ({
  cells,
  rows,
  rowsPerPage,
  page,
  linkField = null,
  linkPrefix = null,
  onClick = null,
  dense = false,
  defaultOrderBy = 'name',
  defaultOrderDirection = 'asc',
  showEmpty = false
}) => {
  const theme = useTheme();

  const [order, setOrder] = useState<Order>(defaultOrderDirection);
  const [orderBy, setOrderBy] = useState<string>(defaultOrderBy);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div style={{ paddingTop: '16px', paddingLeft: '4px', paddingRight: '4px' }}>
      <Paper
        sx={{
          width: '100%',
          marginBottom: theme.spacing(2)
        }}
      >
        <TableContainer>
          <DivTable aria-labelledby="tableTitle" aria-label="enhanced table" sx={{ minWidth: 750 }}>
            <EnhancedTableHead
              dense={dense}
              cells={cells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <DivTableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) =>
                  linkField && linkPrefix ? (
                    <LinkRow
                      hover
                      component={Link}
                      to={`${linkPrefix}${row[linkField]}`}
                      onClick={
                        onClick
                          ? event => {
                              event.preventDefault();
                              onClick(row);
                            }
                          : null
                      }
                      tabIndex={-1}
                      key={index}
                    >
                      {cells.map(head => (
                        <DivTableCell
                          key={head.id}
                          align={head.numeric ? 'right' : 'inherit'}
                          sx={{
                            ...(!dense && {
                              paddingLeft: theme.spacing(1),
                              paddingRight: theme.spacing(1),
                              paddingTop: theme.spacing(1.5),
                              paddingBottom: theme.spacing(1.5)
                            }),

                            ...(head.break && {
                              [theme.breakpoints.up('md')]: {
                                wordBreak: 'break-word'
                              }
                            })
                          }}
                        >
                          {head.id === 'classification' ? (
                            <Classification c12n={row[head.id]} type="text" />
                          ) : (
                            `${row[head.id]}`
                          )}
                        </DivTableCell>
                      ))}
                    </LinkRow>
                  ) : (
                    <DivTableRow hover onClick={onClick ? () => onClick(row) : null} tabIndex={-1} key={index}>
                      {cells.map(head => (
                        <DivTableCell
                          key={head.id}
                          align={head.numeric ? 'right' : 'inherit'}
                          sx={{
                            ...(!dense && {
                              paddingLeft: theme.spacing(1),
                              paddingRight: theme.spacing(1),
                              paddingTop: theme.spacing(1.5),
                              paddingBottom: theme.spacing(1.5)
                            }),

                            ...(head.break && {
                              [theme.breakpoints.up('md')]: {
                                wordBreak: 'break-word'
                              }
                            })
                          }}
                        >
                          {head.id === 'classification' ? (
                            <Classification c12n={row[head.id]} type="text" />
                          ) : (
                            `${row[head.id]}`
                          )}
                        </DivTableCell>
                      ))}
                    </DivTableRow>
                  )
                )}
              {showEmpty && emptyRows > 0 && (
                <DivTableRow style={{ height: (dense ? 45 : 53) * emptyRows }}>
                  <TableCell colSpan={cells.length} />
                </DivTableRow>
              )}
            </DivTableBody>
          </DivTable>
        </TableContainer>
      </Paper>
    </div>
  );
};

interface EnhancedTableProps {
  cells: Cell[];
  rows: any[];
  linkField?: string;
  linkPrefix?: string;
  onClick?: (row: any) => void;
  defaultOrderBy?: string;
  defaultOrderDirection?: Order;
  dense?: boolean;
  showEmpty?: boolean;
}

const WrappedEnhancedTable: React.FC<EnhancedTableProps> = ({
  cells,
  rows,
  linkField = null,
  linkPrefix = null,
  onClick = null,
  dense = false,
  defaultOrderBy = 'name',
  defaultOrderDirection = 'asc',
  showEmpty = false
}) => {
  const [filteredRows, setFilteredRows] = React.useState(rows);
  const [page, setPage] = React.useState(0);
  const [filter, setFilter] = React.useState('');
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filterData = () => {
    const filterItems = filter.toLowerCase().split(' ');
    const filtered = [];
    rows.forEach(row => {
      const jsonRow = JSON.stringify(row).toLowerCase();
      if (filterItems.every(item => jsonRow.indexOf(item) > -1)) {
        filtered.push(row);
      }
    });
    setFilteredRows(filtered);
    setPage(0);
  };

  useEffect(() => {
    throttler.delay(filterData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, rows]);

  return (
    <div style={{ width: '100%' }}>
      <EnhancedTableToolbar
        itemCount={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        filter={filter}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        handleFilter={value => setFilter(value)}
      />
      <EnhancedTableBody
        cells={cells}
        rows={filteredRows}
        rowsPerPage={rowsPerPage}
        page={page}
        linkField={linkField}
        linkPrefix={linkPrefix}
        onClick={onClick}
        dense={dense}
        defaultOrderBy={defaultOrderBy}
        defaultOrderDirection={defaultOrderDirection}
        showEmpty={showEmpty}
      />
    </div>
  );
};

const EnhancedTableBody = React.memo(WrappedEnhancedTableBody);
const EnhancedTableHead = React.memo(WrappedEnhancedTableHead);
const EnhancedTable = React.memo(WrappedEnhancedTable);
export default EnhancedTable;
