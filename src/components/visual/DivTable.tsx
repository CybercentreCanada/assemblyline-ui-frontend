import { Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import 'moment/locale/fr';
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
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE',
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
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE',
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

export const SortableHeaderCell = ({ children, sortField, allowSort = true, ...other }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const curSort = searchParams.get('sort');
  const navigate = useNavigate();
  const active = curSort && curSort.indexOf(sortField) !== -1;
  const dir = active && curSort.indexOf('asc') !== -1 ? 'asc' : 'desc';

  const triggerSort = () => {
    if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf('asc') === -1) {
      searchParams.set('sort', `${sortField} asc`);
    } else {
      searchParams.set('sort', `${sortField} desc`);
    }
    navigate(`${location.pathname}?${searchParams.toString()}`);
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
