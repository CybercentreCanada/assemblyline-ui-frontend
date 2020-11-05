import { createStyles, Table, TableBody, TableCell, TableHead, TableRow, Theme, withStyles } from '@material-ui/core';
import 'moment/locale/fr';
import React from 'react';
import { Link } from 'react-router-dom';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: '8px',
      paddingLeft: '8px'
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    },
    body: {
      wordBreak: 'break-word'
    }
  })
)(TableCell);

export const DivTableCell = ({ children, ...other }) => {
  return (
    <StyledTableCell {...other} component="div">
      {children}
    </StyledTableCell>
  );
};

export const LinkRow = ({ children, to, ...other }) => {
  return (
    <TableRow {...other} component={Link} to={to}>
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
