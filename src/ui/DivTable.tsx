import type { TableBodyProps, TableCellProps, TableHeadProps, TableProps, TableRowProps } from '@mui/material';
import {
  Link as MaterialLink,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import type { InferAppNavigationPropsFromPath } from 'core/router';
import { AppLink, useAppNavigate, useAppSearchSnapshot } from 'core/router';
import React from 'react';
import type SimpleSearchQuery from 'ui/SearchBar/simple-search-query';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  ['&.MuiTableCell-root']: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1)
  },
  ['&.MuiTableCell-head']: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 5%)' : 'rgba(0, 0, 0, 5%)',
    whiteSpace: 'nowrap'
  }
}));

const BreakableTableCell = styled(TableCell)(({ theme }) => ({
  ['&.MuiTableCell-root']: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      wordBreak: 'break-word'
    }
  },
  ['&.MuiTableCell-head']: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 5%)' : 'rgba(0, 0, 0, 5%)',
    whiteSpace: 'nowrap'
  }
}));

interface CellProps extends TableCellProps {
  children?: React.ReactNode;
  breakable?: boolean;
}

export const DivTableCell = ({ children = null, breakable = false, ...other }: CellProps) =>
  breakable ? (
    <BreakableTableCell {...other} component="div">
      {children}
    </BreakableTableCell>
  ) : (
    <StyledTableCell {...other} component="div">
      {children}
    </StyledTableCell>
  );

type SortableHeaderCellProps = TableCellProps & {
  query?: SimpleSearchQuery;
  sortName?: string;
  sortField: string;
  allowSort?: boolean;
  inverted?: boolean;
  onSort?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, value: { name: string; field: string }) => void;
};

export const SortableHeaderCell: React.FC<SortableHeaderCellProps> = ({
  allowSort = true,
  children,
  query = null,
  sortField,
  sortName = 'sort',
  inverted = false,
  onSort = null,
  ...other
}) => {
  const search = useAppSearchSnapshot<'/submissions'>();
  const curSort = query ? query.get(sortName) : search.get('sort');
  const navigate = useAppNavigate<'/submissions'>();
  const active = curSort && curSort.indexOf(sortField) !== -1;
  const ascending = inverted ? 'desc' : 'asc';
  const descending = inverted ? 'asc' : 'desc';
  const dir = active && curSort.indexOf(ascending) !== -1 ? ascending : descending;

  const triggerSort = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const nextSort =
      curSort && curSort.indexOf(sortField) !== -1 && curSort.indexOf(ascending) === -1
        ? `${sortField} ${ascending}`
        : `${sortField} ${descending}`;

    if (onSort) {
      onSort(event, { name: sortName, field: nextSort });
    } else {
      navigate.here().update(s => ({ ...s, search: { ...s.search, sort: nextSort } }));
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

type LinkTarget = string | { pathname?: string; search?: string; hash?: string };

type LinkRowProps<Origin extends AppRoute['path'] = AppRoute['path']> = TableRowProps &
  InferAppNavigationPropsFromPath<Origin> & {
    to?: LinkTarget;
  };

export const LinkRow = React.memo(function LinkRow<const Origin extends AppRoute['path']>({
  children,
  nav = null,
  navDeps = null,
  to,
  component,
  ...other
}: LinkRowProps<Origin>) {
  const target = typeof to === 'string' ? to : to ? `${to.pathname ?? ''}${to.search ?? ''}${to.hash ?? ''}` : null;
  const resolvedNav = nav ?? (target ? navigate => navigate.to().create(target) : null);
  const linkProps = resolvedNav
    ? { component: AppLink, nav: resolvedNav, navDeps: navDeps ?? (target ? [target] : null) }
    : { component: component ?? 'div' };

  return (
    <TableRow {...other} {...linkProps} style={{ cursor: 'pointer', textDecoration: 'none' }}>
      {children}
    </TableRow>
  );
}) as unknown as <const Origin extends AppRoute['path']>(props: LinkRowProps<Origin>) => React.JSX.Element;

export const ExternalLinkRow = ({ children, href, ...other }) => (
  <TableRow
    component={MaterialLink}
    {...other}
    href={href}
    target="_blank"
    style={{ cursor: 'pointer', textDecoration: 'none' }}
  >
    {children}
  </TableRow>
);

export const DivTableRow = ({ children, ...other }) => (
  <TableRow {...other} component="div">
    {children}
  </TableRow>
);

export const DivTableHead = ({ children, ...other }: TableHeadProps) => (
  <TableHead {...other} component="div">
    {children}
  </TableHead>
);

export const DivTableBody = ({ children, ...other }: TableBodyProps) => (
  <TableBody {...other} component="div">
    {children}
  </TableBody>
);

export const DivTable = ({ children, size = 'small' as const, ...other }: TableProps) => (
  <Table size={size} {...other} component="div">
    {children}
  </Table>
);
