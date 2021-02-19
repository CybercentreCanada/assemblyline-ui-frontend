import {
  createStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Theme,
  withStyles
} from '@material-ui/core';
import 'moment/locale/fr';
import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: '8px',
      paddingLeft: '8px'
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

type CellProps = {
  children?: React.ReactNode;
  [key: string]: any;
};

export const DivTableCell = ({ children, ...other }: CellProps) => {
  return (
    <StyledTableCell {...other} component="div">
      {children}
    </StyledTableCell>
  );
};

DivTableCell.defaultProps = {
  children: null
};

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

export const LinkRow = ({ children, to, ...other }) => {
  return (
    <TableRow component={Link} {...other} to={to} style={{ cursor: 'pointer', textDecoration: 'none' }}>
      {children}
    </TableRow>
  );
};

export const DivTableRow = ({ children, ...other }) => {
  return (
    <TableRow {...other} component="div">
      {children}
    </TableRow>
  );
};

export const DivTableHead = ({ children, ...other }) => {
  return (
    <TableHead {...other} component="div">
      {children}
    </TableHead>
  );
};

export const DivTableBody = ({ children, ...other }) => {
  return (
    <TableBody {...other} component="div">
      {children}
    </TableBody>
  );
};

export const DivTable = ({ children, size = 'small' as 'small', ...other }) => {
  return (
    <Table size={size} {...other} component="div">
      {children}
    </Table>
  );
};
