import {
  styled,
  Table,
  TableBody,
  TableBodyProps,
  TableCell,
  TableCellProps,
  TableHead,
  TableHeadProps,
  TableProps,
  TableRow,
  TableRowProps,
  TableSortLabel
} from '@mui/material';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React from 'react';
import { To, useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

interface GridTableProps extends TableProps {
  component?: never;
  columns?: number;
}

export const GridTable = styled(
  ({ size = 'small', ...other }: GridTableProps) => <Table size={size} {...other} component="div" />,
  {
    shouldForwardProp: prop => prop !== 'columns'
  }
)<GridTableProps>(({ columns }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, auto)`,
  gridAutoFlow: 'row',
  alignItems: 'stretch',
  overflowX: 'auto'
}));

export const GridTableHead = styled(props => <TableHead {...props} component="div" />)<TableHeadProps>(() => ({
  display: 'contents'
}));

export const GridTableBody = styled(props => <TableBody {...props} component="div" />)<TableBodyProps>(() => ({
  display: 'contents'
}));

export const GridTableRow = styled(props => <TableRow {...props} component="div" />)<TableRowProps>(() => ({
  display: 'contents'
}));

interface GridLinkRowProps extends TableRowProps {
  component?: never;
  to: To;
}

export const GridLinkRow = styled(
  ({ to, ...other }: GridLinkRowProps) => <TableRow {...(other as any)} component={Link} to={to} />,
  {
    shouldForwardProp: prop => prop !== 'hover' && prop !== 'selected'
  }
)<GridLinkRowProps>(({ theme, hover = false, selected = false }) => ({
  display: 'contents',
  cursor: 'pointer',
  textDecoration: 'none',
  ...(hover && {
    '&:hover>div': {
      backgroundColor: theme.palette.action.hover
    }
  }),
  ...(selected && {
    '&>div': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(124, 147, 185, 0.16)' : 'rgba(11, 101, 161, 0.08)'
    }
  })
}));

interface GridTableCellProps extends TableCellProps {
  breakable?: boolean;
  center?: boolean;
  component?: never;
  hidden?: boolean;
}

export const GridTableCell = styled(
  ({ children, ...other }: GridTableCellProps) => (
    <TableCell {...other} component="div">
      <div>{children}</div>
    </TableCell>
  ),
  {
    shouldForwardProp: prop => prop !== 'breakable' && prop !== 'center' && prop !== 'hidden'
  }
)<GridTableCellProps>(({ theme, breakable = false, center = false, hidden = false }) => ({
  '&.MuiTableCell-root': {
    display: 'grid',
    alignItems: 'center',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    ...(center && {
      justifyContent: 'center'
    }),
    ...(breakable && {
      [theme.breakpoints.up('md')]: {
        wordBreak: 'break-word'
      }
    }),
    ...(hidden && {
      '&>div': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    })
  },
  '&.MuiTableCell-head': {
    backgroundColor: 'rgba(0, 0, 0, 5%)',
    whiteSpace: 'nowrap'
  }
}));

interface SortableGridHeaderCellProps extends GridTableCellProps {
  allowSort?: boolean;
  query?: SimpleSearchQuery;
  sortField: string;
  sortName?: string;
  reverseDirection?: boolean;
  onSort?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, value: { name: string; field: string }) => void;
}

export const SortableGridHeaderCell: React.FC<SortableGridHeaderCellProps> = ({
  allowSort = true,
  children,
  query = null,
  sortField,
  sortName = 'sort',
  reverseDirection = false,
  onSort = null,
  ...other
}: SortableGridHeaderCellProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const curSort = query ? query.get(sortName) : searchParams.get(sortName);
  const navigate = useNavigate();
  const active = curSort && curSort.indexOf(sortField) !== -1;
  const ascending = reverseDirection ? 'asc' : 'desc';
  const descending = reverseDirection ? 'desc' : 'asc';
  const dir = active && curSort.indexOf(ascending) !== -1 ? ascending : descending;

  const triggerSort = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf(ascending) === -1) {
      searchParams.set(sortName, `${sortField} ${ascending}`);
    } else {
      searchParams.set(sortName, `${sortField} ${descending}`);
    }

    if (onSort) {
      onSort(event, { name: sortName, field: searchParams.get(sortName) });
    } else {
      navigate(`${location.pathname}?${searchParams.toString()}${location.hash}`);
    }
  };

  return (
    <GridTableCell {...other}>
      {allowSort ? (
        <TableSortLabel active={active} direction={dir} onClick={triggerSort}>
          {children}
        </TableSortLabel>
      ) : (
        children
      )}
    </GridTableCell>
  );
};
