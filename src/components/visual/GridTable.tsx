import { Table, TableCell, TableCellProps, TableRow, TableSortLabel, TableTypeMap, Theme } from '@mui/material';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import clsx from 'clsx';
import React from 'react';
import { To, useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  gridTable: {
    display: 'grid',
    gridAutoFlow: 'row',
    alignItems: 'stretch',
    overflowX: 'auto'
  },
  content: {
    display: 'contents'
  },
  thead: {
    '&>div>div': {
      fontWeight: 500,
      lineHeight: '1.5rem',
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  },
  tbody: {
    '&>div>div': {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1)
    }
  },
  tr: {},
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
  chip: {
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(1)
  }
}));

/**
 *  Grid Table Component
 */
type GridTableProps = DefaultComponentProps<TableTypeMap<{ nbOfColumns?: number }, 'table'>>;

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

/**
 *  Grid Table Head Component
 */
type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const GridTableHead = ({ children, className, ...other }: DivProps) => {
  const classes = useStyles();
  return <div className={clsx(classes.content, classes.thead, className)} children={children} {...other} />;
};

/**
 *  Grid Table Body Component
 */
export const GridTableBody = ({ children, className, ...other }: DivProps) => {
  const classes = useStyles();
  return <div className={clsx(classes.content, classes.tbody, className)} children={children} {...other} />;
};

/**
 *  Grid Table Row Component
 */
type GridTableRowProps2 = DivProps & {
  hover?: boolean;
  selected?: boolean;
  link?: boolean;
  to?: To;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
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
}: GridTableRowProps2) => {
  const classes = useStyles();

  if (link)
    return (
      <Link
        className={clsx(
          classes.content,
          classes.tr,
          classes.link,
          hover && classes.trHover,
          selected && classes.trSelected,
          className
        )}
        to={to}
        children={children}
        onClick={onClick}
      />
    );
  else
    return (
      <div
        className={clsx(
          classes.content,
          classes.tr,
          hover && classes.trHover,
          selected && classes.trSelected,
          className
        )}
        children={children}
        {...other}
      />
    );
};

/**
 *  Grid Table Header Component
 */
type GridTableHeaderProps = TableCellProps & {
  sortField?: string;
  allowSort?: boolean;
  noWrap?: boolean;
  invertedSort?: boolean;
};

export const GridTableHeader = ({
  children,
  className,
  sortField = '',
  allowSort = false,
  noWrap = false,
  invertedSort = false,
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
  const triggerSort = () => {
    if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf(sortDir.a as string) === -1) {
      searchParams.set('sort', `${sortField} ${sortDir.a}`);
    } else {
      searchParams.set('sort', `${sortField} ${sortDir.b}`);
    }
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  // const dir = active && curSort.indexOf('asc') !== -1 ? 'asc' : 'desc';

  // const triggerSort = () => {
  //   if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf('asc') === -1) {
  //     searchParams.set('sort', `${sortField} asc`);
  //   } else {
  //     searchParams.set('sort', `${sortField} desc`);
  //   }
  //   navigate(`${location.pathname}?${searchParams.toString()}`);
  // };

  if (allowSort)
    return (
      <TableCell className={clsx(classes.cell, noWrap && classes.noWrap, className)} component="div" {...other}>
        <TableSortLabel
          component="div"
          className={clsx(noWrap && classes.noWrap)}
          children={<span className={clsx(noWrap && classes.noWrap)}>{children}</span>}
          active={active}
          direction={dir}
          onClick={triggerSort}
        />
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

type GridTableCellProps = TableCellProps & { noWrap?: boolean };

export const GridTableCell = ({ children, noWrap = false, className, ...other }: GridTableCellProps) => {
  const classes = useStyles();

  if (noWrap)
    return (
      <TableCell
        children={<span className={clsx(classes.noWrap)}>{children}</span>}
        component="div"
        className={clsx(classes.cell, classes.noWrap, className)}
        {...other}
      />
    );
  else
    return (
      <TableCell
        children={<span>{children}</span>}
        component="div"
        className={clsx(classes.cell, className)}
        {...other}
      />
    );

  // return (
  //   <TableCell
  //     component="div"
  //     children={<div>{children}</div>}
  //     style={{
  //       display: 'flex',
  //       alignItems: 'center',
  //       paddingLeft: theme.spacing(1),
  //       paddingRight: theme.spacing(1),
  //       ...style
  //     }}
  //     {...other}
  //   />
  // );
};

export const GridTableWrapCell = ({ children, ...other }) => (
  <TableCell
    component="div"
    children={<div>{children}</div>}
    style={{
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}
    {...other}
  />
);

/**
 *  Grid Table Header Cell Component
 */
// type SortableGridTableCellProps = TableCellProps & { sortField: string; allowSort?: boolean };

// export const SortableGridTableCell = ({
//   children,
//   sortField,
//   allowSort = true,
//   ...other
// }: SortableGridTableCellProps) => {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const curSort = searchParams.get('sort');
//   const navigate = useNavigate();
//   const active = curSort && curSort.indexOf(sortField) !== -1;
//   const dir = active && curSort.indexOf('asc') !== -1 ? 'asc' : 'desc';

//   const triggerSort = () => {
//     if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf('asc') === -1) {
//       searchParams.set('sort', `${sortField} asc`);
//     } else {
//       searchParams.set('sort', `${sortField} desc`);
//     }
//     navigate(`${location.pathname}?${searchParams.toString()}`);
//   };
//   return (
//     <StyledTableCell {...other} component="div">
//       {allowSort ? (
//         <TableSortLabel active={active} direction={dir} onClick={triggerSort}>
//           {children}
//         </TableSortLabel>
//       ) : (
//         children
//       )}
//     </StyledTableCell>
//   );
// };

/** Other to be deleted */

export const GridLinkRow = ({ children, to, ...other }) => (
  <TableRow
    component={Link}
    {...other}
    to={to}
    style={{
      display: 'contents',
      cursor: 'pointer',
      textDecoration: 'none'
    }}
    sx={{
      '&:hover>div': { backgroundColor: 'rgba(81,81,81,1)' }
    }}
  >
    {children}
  </TableRow>
);

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

// export const GridTableRow = ({ children, ...other }) => (
//   <TableRow
//     children={children}
//     component="div"
//     sx={{
//       '&>div': {
//         cursor: 'pointer',
//         textDecoration: 'none'
//       }
//     }}
//     style={{ display: 'contents' }}
//     {...other}
//   />
// );

// export const GridLinkRow = ({ children, to, ...other }) => (
//   <TableRow
//     component={Link}
//     {...other}
//     to={to}
//     style={{
//       display: 'contents',
//       cursor: 'pointer',
//       textDecoration: 'none'
//     }}
//     sx={{
//       '&:hover>div': { backgroundColor: 'rgba(81,81,81,1)' }
//     }}
//   >
//     {children}
//   </TableRow>
// );

// type GridTableCellProps = {
//   children?: React.ReactNode;
//   style?: CSSProperties;
// };

// export const GridTableCell = ({ children, style, ...other }: GridTableCellProps) => {
//   const theme = useTheme();

//   console.log(children);
//   return (
//     <TableCell
//       component="div"
//       children={<div>{children}</div>}
//       style={{
//         display: 'flex',
//         alignItems: 'center',
//         paddingLeft: theme.spacing(1),
//         paddingRight: theme.spacing(1),
//         ...style
//       }}
//       {...other}
//     />
//   );
// };

// export const GridTableWrapCell = ({ children, ...other }) => (
//   <TableCell
//     component="div"
//     children={<div>{children}</div>}
//     style={{
//       display: 'flex',
//       alignItems: 'center',
//       whiteSpace: 'nowrap',
//       overflow: 'hidden',
//       textOverflow: 'ellipsis'
//     }}
//     {...other}
//   />
// );
