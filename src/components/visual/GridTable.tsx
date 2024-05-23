import {
  Paper,
  PaperProps,
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
import React, { FC, forwardRef, memo } from 'react';
import { To, useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

interface StyledPaperProps extends PaperProps {
  component?: any;
  paper?: boolean;
}

export const StyledPaper: FC<StyledPaperProps> = memo(
  styled(
    forwardRef(({ component, ...other }: StyledPaperProps, ref) => (
      <Paper component={component} {...other} ref={ref} />
    )),
    {
      shouldForwardProp: prop => prop !== 'paper'
    }
  )<StyledPaperProps>(({ theme, paper = false }) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? '#0000001A' : '#FFFFFF1A',
    backgroundColor: paper
      ? theme.palette.mode === 'dark'
        ? '#00000010'
        : '#FFFFFF06'
      : theme.palette.mode === 'dark'
      ? '#FFFFFF10'
      : '#00000006'
  }))
);

interface GridTableProps extends TableProps {
  component?: React.ElementType<any>;
  columns?: number;
  paper?: boolean;
}

export const GridTable: FC<GridTableProps> = memo(
  styled(
    ({ component = 'div', size = 'small', paper = false, ...other }: GridTableProps) => (
      <Table size={size} {...other} component={component} />
    ),
    {
      shouldForwardProp: prop => prop !== 'columns' && prop !== 'paper'
    }
  )<GridTableProps>(({ theme, columns, paper = false }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, auto)`,
    gridAutoFlow: 'row',
    alignItems: 'stretch',
    overflowX: 'auto',
    backgroundColor: paper
      ? theme.palette.mode === 'dark'
        ? theme.palette.background.default
        : theme.palette.background.paper
      : theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.background.default,
    '&>*>*>*.MuiTableCell-head': {
      backgroundColor: paper
        ? theme.palette.mode === 'dark'
          ? '#383838'
          : '#F6F6F6'
        : theme.palette.mode === 'dark'
        ? '#494949'
        : '#F3F3F3'
    }
  }))
);

interface GridTableHeadProps extends TableHeadProps {
  component?: React.ElementType<any>;
}

export const GridTableHead: FC<GridTableHeadProps> = memo(
  styled(({ component = 'div', ...other }: GridTableHeadProps) => (
    <TableHead component={component} {...other} />
  ))<GridTableHeadProps>(() => ({
    display: 'contents'
  }))
);

interface GridTableBodyProps extends TableBodyProps {
  component?: React.ElementType<any>;
  alternating?: boolean;
}

export const GridTableBody: FC<GridTableBodyProps> = memo(
  styled(({ component = 'div', ...other }: GridTableBodyProps) => <TableBody component={component} {...other} />, {
    shouldForwardProp: prop => prop !== 'alternating'
  })<GridTableBodyProps>(({ theme, alternating = false }) => ({
    display: 'contents',
    '&>*:last-child>*': {
      borderBottom: 'none'
    },
    ...(alternating && {
      '&>*:nth-of-type(even)>*': {
        backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF0A' : '#00000008'
      }
    })
  }))
);

interface GridTableRowProps extends TableRowProps {
  component?: React.ElementType<any>;
}

export const GridTableRow: FC<GridTableRowProps> = memo(
  styled(({ component = 'div', ...other }: GridTableRowProps) => <TableRow component={component} {...other} />, {
    shouldForwardProp: prop => prop !== 'hover' && prop !== 'selected'
  })<GridTableRowProps>(({ theme, hover = false, selected = false }) => ({
    display: 'contents',
    ...(hover && {
      '&:hover>div': {
        backgroundColor: theme.palette.action.hover
      }
    }),
    ...(selected && {
      '&>div': {
        backgroundColor: theme.palette.action.selected
      }
    })
  }))
);

interface GridLinkRowProps extends GridTableRowProps {
  component?: never;
  to: To;
}

export const GridLinkRow: FC<GridLinkRowProps> = memo(
  styled(({ to, ...other }: GridLinkRowProps) => (
    <GridTableRow {...(other as any)} component={Link} to={to} />
  ))<GridLinkRowProps>(() => ({
    cursor: 'pointer',
    textDecoration: 'none'
  }))
);

interface GridTableCellProps extends TableCellProps {
  breakable?: boolean;
  center?: boolean;
  hidden?: boolean;
}

export const GridTableCell: FC<GridTableCellProps> = memo(
  styled(
    ({ children, component = 'div', ...other }: GridTableCellProps) => (
      <TableCell {...other} component={component}>
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
      whiteSpace: 'nowrap'
    }
  }))
);

interface SortableGridHeaderCellProps extends GridTableCellProps {
  allowSort?: boolean;
  query?: SimpleSearchQuery;
  sortField: string;
  sortName?: string;
  inverted?: boolean;
  onSort?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, value: { name: string; field: string }) => void;
}

export const SortableGridHeaderCell: FC<SortableGridHeaderCellProps> = memo(
  ({
    allowSort = true,
    children,
    query = null,
    sortField,
    sortName = 'sort',
    inverted = false,
    onSort = null,
    ...other
  }: SortableGridHeaderCellProps) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const curSort = query ? query.get(sortName) : searchParams.get(sortName);
    const navigate = useNavigate();
    const active = curSort && curSort.indexOf(sortField) !== -1;
    const ascending = inverted ? 'asc' : 'desc';
    const descending = inverted ? 'desc' : 'asc';
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
  }
);
