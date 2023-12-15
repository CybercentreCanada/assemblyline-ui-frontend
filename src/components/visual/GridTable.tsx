import { Table, TableCell, TableCellProps, TableSortLabel, TableTypeMap, Theme } from '@mui/material';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { To, useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  gridTable: {
    display: 'grid',
    gridAutoFlow: 'row',
    alignItems: 'stretch',
    overflowX: 'auto',
    borderRadius: theme.spacing(0.5)
  },
  content: {
    display: 'contents'
  },
  thead: {
    '&>div>div': {
      fontWeight: 500,
      lineHeight: '1.5rem',
      backgroundColor: theme.palette.mode === 'dark' ? 'rgb(64,64,64)' : '#EEE',
      whiteSpace: 'nowrap'
    }
  },
  tbody: {
    '&>div>div': {
      // paddingRight: theme.spacing(1),
      // paddingLeft: theme.spacing(1)
    }
  },
  trHover: {
    '&:hover>div': {
      backgroundColor: theme.palette.action.hover
    }
  },
  trSelected: {
    '&>div': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(124, 147, 185, 0.16)' : 'rgba(11, 101, 161, 0.08)'
    }
  },
  link: {
    cursor: 'pointer',
    color: theme.palette.text.primary,
    textDecoration: 'none'
  },
  sortLabel: {
    '&.MuiTableSortLabel-root': {
      width: '100%'
    }
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1)
  },
  noWrap: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  wrap: {
    overflow: 'hidden'
  },
  hidden: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

type GridTableProps = DefaultComponentProps<TableTypeMap<{ nbOfColumns?: number }, 'table'>>;
type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
type GridTableCellProps = TableCellProps & { wrap?: boolean; hidden?: boolean };
type GridTableRowProps = DivProps & {
  hover?: boolean;
  selected?: boolean;
  link?: boolean;
  to?: To;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};
type GridTableHeaderProps = TableCellProps & {
  sortName?: string;
  sortField?: string;
  allowSort?: boolean;
  noWrap?: boolean;
  invertedSort?: boolean;
  onSort?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, value: { name: string; field: string }) => void;
};

export const GridTable = ({
  children = null,
  nbOfColumns = 0,
  size = 'small',
  style = null,
  ...other
}: GridTableProps) => {
  const classes = useStyles();
  return (
    <Table
      component="div"
      className={classes.gridTable}
      children={children}
      size={size}
      style={{ gridTemplateColumns: `repeat(${nbOfColumns}, auto)`, ...style }}
      {...other}
    />
  );
};

export const GridTableHead = ({ children, className, ...other }: DivProps) => {
  const classes = useStyles();
  return <div className={clsx(classes.content, classes.thead, className)} children={children} {...other} />;
};

export const GridTableBody = ({ children, className, ...other }: DivProps) => {
  const classes = useStyles();
  return <div className={clsx(classes.content, classes.tbody, className)} children={children} {...other} />;
};

export const GridTableRow = ({
  children,
  className,
  hover = false,
  selected = false,
  link = false,
  to = '',
  onClick = null,
  ...other
}: GridTableRowProps) => {
  const classes = useStyles();

  if (link)
    return (
      <Link
        className={clsx(
          classes.content,
          classes.link,
          hover && classes.trHover,
          selected && classes.trSelected,
          className
        )}
        to={to}
        children={children}
        onClick={onClick}
        {...(other as any)}
      />
    );
  else
    return (
      <div
        className={clsx(classes.content, hover && classes.trHover, selected && classes.trSelected, className)}
        children={children}
        {...other}
      />
    );
};

export const GridTableHeader = ({
  children,
  className,
  sortField = '',
  sortName = 'sort',
  allowSort = false,
  noWrap = false,
  invertedSort = false,
  onSort = null,
  ...other
}: GridTableHeaderProps) => {
  const classes = useStyles();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const curSort = searchParams.get('sort');
  const navigate = useNavigate();
  const active = curSort && curSort.indexOf(sortField) !== -1;
  const sortDir: { [k: string]: 'asc' | 'desc' } = invertedSort ? { a: 'asc', b: 'desc' } : { a: 'desc', b: 'asc' };
  const dir = active && curSort.indexOf(sortDir.a as string) !== -1 ? sortDir.a : sortDir.b;

  const triggerSort = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf(sortDir.a as string) === -1) {
      searchParams.set('sort', `${sortField} ${sortDir.a}`);
    } else {
      searchParams.set('sort', `${sortField} ${sortDir.b}`);
    }

    if (onSort) {
      onSort(event, { name: sortName, field: searchParams.get(sortName) });
    } else {
      navigate(`${location.pathname}?${searchParams.toString()}${location.hash}`);
    }
  };

  if (allowSort)
    return (
      <TableCell className={clsx(classes.cell, noWrap && classes.noWrap, className)} component="div" {...other}>
        <TableSortLabel
          component="div"
          className={clsx(classes.sortLabel, noWrap && classes.noWrap)}
          children={<span className={clsx(noWrap && classes.noWrap)}>{children}</span>}
          active={active}
          direction={dir}
          onClick={triggerSort}
        />
        <div style={{ flex: 1 }} />
      </TableCell>
    );
  else
    return (
      <TableCell
        className={clsx(classes.cell, noWrap && classes.noWrap, className)}
        children={<span className={clsx(classes.noWrap)}>{children}</span>}
        component="div"
        {...other}
      />
    );
};

export const GridTableCell = ({ children, wrap = false, hidden = false, className, ...other }: GridTableCellProps) => {
  const classes = useStyles();
  return (
    <TableCell
      component="div"
      className={clsx(classes.cell, wrap && classes.wrap, hidden && classes.hidden, className)}
      children={
        <span className={clsx(wrap && classes.wrap, hidden && classes.hidden)} style={{ flex: 1 }}>
          {children}
        </span>
      }
      {...other}
    />
  );
};
