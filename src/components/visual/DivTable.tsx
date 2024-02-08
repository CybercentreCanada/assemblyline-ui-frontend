import { Table, TableBody, TableCell, TableCellProps, TableHead, TableRow, TableSortLabel, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React from 'react';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1)
    },
    head: {
      backgroundColor: 'rgba(0, 0, 0, 5%)',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

const BreakableTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        wordBreak: 'break-word'
      }
    },
    head: {
      backgroundColor: 'rgba(0, 0, 0, 5%)',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

type CellProps = {
  children?: React.ReactNode;
  breakable?: boolean;
  [key: string]: any;
};

export const DivTableCell = ({ children, breakable, ...other }: CellProps) =>
  breakable ? (
    <BreakableTableCell {...other} component="div">
      {children}
    </BreakableTableCell>
  ) : (
    <StyledTableCell {...other} component="div">
      {children}
    </StyledTableCell>
  );

DivTableCell.defaultProps = {
  children: null,
  breakable: false
};

type SortableHeaderCellProps = TableCellProps & {
  query?: SimpleSearchQuery;
  sortName?: string;
  sortField: string;
  allowSort?: boolean;
  onSort?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, value: { name: string; field: string }) => void;
};

export const SortableHeaderCell: React.FC<SortableHeaderCellProps> = ({
  allowSort = true,
  children,
  query = null,
  sortField,
  sortName = 'sort',
  onSort = null,
  ...other
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const curSort = query ? query.get(sortName) : searchParams.get(sortName);
  const navigate = useNavigate();
  const active = curSort && curSort.indexOf(sortField) !== -1;
  const dir = active && curSort.indexOf('asc') !== -1 ? 'asc' : 'desc';

  const triggerSort = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf('asc') === -1) {
      searchParams.set(sortName, `${sortField} asc`);
    } else {
      searchParams.set(sortName, `${sortField} desc`);
    }

    if (onSort) {
      onSort(event, { name: sortName, field: searchParams.get(sortName) });
    } else {
      navigate(`${location.pathname}?${searchParams.toString()}${location.hash}`);
    }
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

export const LinkRow = ({ children, to, ...other }) => (
  <TableRow component={Link} {...other} to={to} style={{ cursor: 'pointer', textDecoration: 'none' }}>
    {children}
  </TableRow>
);

export const DivTableRow = ({ children, ...other }) => (
  <TableRow {...other} component="div">
    {children}
  </TableRow>
);

export const DivTableHead = ({ children, ...other }) => (
  <TableHead {...other} component="div">
    {children}
  </TableHead>
);

export const DivTableBody = ({ children, ...other }) => (
  <TableBody {...other} component="div">
    {children}
  </TableBody>
);

export const DivTable = ({ children, size = 'small' as 'small', ...other }) => (
  <Table size={size} {...other} component="div">
    {children}
  </Table>
);
