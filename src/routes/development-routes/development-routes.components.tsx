import {
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useAppConfigStore } from 'core/config';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  DevelopmentRoutesHashParamSpec,
  DevelopmentRoutesParamKind,
  DevelopmentRoutesParamSpec,
  DevelopmentRoutesSearchParamSpec,
  DevelopmentRoutesTableRowData
} from 'routes/development-routes';
import {
  createMockRouteLocation,
  FLAG_CHIP_ICON,
  formatFunctionText,
  formatHashParam,
  formatPathParams,
  formatRouteName,
  formatSearchParams,
  PARAM_KIND_LABEL,
  renderIcon,
  SOURCE_ICON,
  SQUARE_CHIP_SX
} from 'routes/development-routes';

//*****************************************************************************************
// Param Kind Badge
//*****************************************************************************************

export type ParamKindBadgeProps = {
  /** Blueprint kind rendered as a single-character badge (e.g. `string`, `number`, `enum`). */
  kind: DevelopmentRoutesParamKind;
};

export const ParamKindBadge = memo(({ kind }: ParamKindBadgeProps) => {
  const theme = useTheme();
  const { t } = useTranslation('developmentRoutes');

  const backgroundColor = {
    string: theme.palette.info.main,
    number: theme.palette.success.main,
    boolean: theme.palette.warning.main,
    enum: theme.palette.secondary.main,
    filters: theme.palette.primary.main,
    object: theme.palette.grey[700]
  }[kind];

  return (
    <Tooltip title={t(`kind.${kind}`)}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          flexShrink: 0,
          borderRadius: theme.shape.borderRadius,
          backgroundColor,
          color: theme.palette.getContrastText(backgroundColor),
          fontSize: kind === 'object' ? 12 : 15,
          fontWeight: 700,
          lineHeight: 1
        }}
      >
        {PARAM_KIND_LABEL[kind]}
      </span>
    </Tooltip>
  );
});

ParamKindBadge.displayName = 'ParamKindBadge';

//*****************************************************************************************
// Path Param Entry
//*****************************************************************************************

export type PathParamEntryProps = {
  /** Path param spec to render (kind badge, key, default value, and enum options). */
  param: DevelopmentRoutesParamSpec;
};

export const PathParamEntry = memo(({ param }: PathParamEntryProps) => (
  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
    <ParamKindBadge kind={param.kind} />
    <Typography variant="body1">{param.key}</Typography>
    {param.defaultValueLabel !== '—' && (
      <Typography color="text.secondary" variant="body2">
        ({param.defaultValueLabel})
      </Typography>
    )}
    {param.options?.length > 0 && (
      <Chip color="secondary" label={param.options.join(', ')} size="small" sx={SQUARE_CHIP_SX} variant="outlined" />
    )}
  </div>
));

PathParamEntry.displayName = 'PathParamEntry';

//*****************************************************************************************
// Search Param Entry
//*****************************************************************************************

export type SearchParamEntryProps = {
  /** Search param spec to render (kind badge, source, key, default value, range, options, and flags). */
  param: DevelopmentRoutesSearchParamSpec;
};

export const SearchParamEntry = memo(({ param }: SearchParamEntryProps) => {
  const theme = useTheme();
  const { t } = useTranslation('developmentRoutes');

  const sourceColor = {
    search: theme.palette.info.main,
    state: theme.palette.secondary.main,
    transient: theme.palette.warning.main
  }[param.source];

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
      <ParamKindBadge kind={param.kind} />
      <Tooltip title={t(`source.${param.source}`)}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${sourceColor}`,
            color: sourceColor,
            lineHeight: 1
          }}
        >
          {SOURCE_ICON[param.source]}
        </span>
      </Tooltip>
      <Typography variant="body1">{param.key}</Typography>
      {param.defaultValueLabel !== '—' && (
        <Typography color="text.secondary" variant="body2">
          ({param.defaultValueLabel})
        </Typography>
      )}
      {param.options?.length > 0 && (
        <Chip color="secondary" label={param.options.join(', ')} size="small" sx={SQUARE_CHIP_SX} variant="outlined" />
      )}
      {((param.min !== null && param.min !== undefined) || (param.max !== null && param.max !== undefined)) && (
        <Chip
          color="secondary"
          label={`${param.min ?? '-∞'}–${param.max ?? '∞'}`}
          size="small"
          sx={SQUARE_CHIP_SX}
          variant="outlined"
        />
      )}
      {param.flags.map(flag => (
        <Tooltip key={flag} title={t(`flag.${flag}`)}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>{FLAG_CHIP_ICON[flag]}</span>
        </Tooltip>
      ))}
    </div>
  );
});

SearchParamEntry.displayName = 'SearchParamEntry';

//*****************************************************************************************
// Hash Param Entry
//*****************************************************************************************

export type HashParamEntryProps = {
  /** Hash param spec to render (kind badge, default value, and enum options). */
  param: DevelopmentRoutesHashParamSpec;
};

export const HashParamEntry = memo(({ param }: HashParamEntryProps) => (
  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
    <ParamKindBadge kind={param.kind} />
    {param.defaultValueLabel !== '—' && (
      <Typography color="text.secondary" variant="body2">
        ({param.defaultValueLabel})
      </Typography>
    )}
    {param.options?.length > 0 && (
      <Chip color="secondary" label={param.options.join(', ')} size="small" sx={SQUARE_CHIP_SX} variant="outlined" />
    )}
  </div>
));

HashParamEntry.displayName = 'HashParamEntry';

//*****************************************************************************************
// Development Routes Table Row
//*****************************************************************************************

export type DevelopmentRoutesTableRowProps = {
  /** Route this row renders metadata, params, and guard functions for. */
  route: AppRoute;
};

export const DevelopmentRoutesTableRow = memo(({ route }: DevelopmentRoutesTableRowProps) => {
  const configState = useAppConfigStore(state => state);
  const { t } = useTranslation('developmentRoutes');
  const mockLocation = createMockRouteLocation(route) as never;
  const shortNameEN = formatRouteName(route.shortname?.(mockLocation, configState), 'en');
  const shortNameFR = formatRouteName(route.shortname?.(mockLocation, configState), 'fr');
  const fullNameEN = formatRouteName(route.fullname?.(mockLocation, configState), 'en');
  const fullNameFR = formatRouteName(route.fullname?.(mockLocation, configState), 'fr');
  const pathParams = formatPathParams(route);
  const searchParams = formatSearchParams(route);
  const hashParam = formatHashParam(route);
  const disabled = formatFunctionText(route.disabled);
  const forbidden = formatFunctionText(route.forbidden);

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell sx={{ verticalAlign: 'top', width: '20%' }}>
        <Typography fontWeight={600} variant="body1">
          {route.path}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {route.ancestor}
        </Typography>
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top', width: '5%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
            <span>{renderIcon(route.shorticon, configState, route)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
            <span>{renderIcon(route.fullicon, configState, route)}</span>
          </div>
        </div>
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top', width: '13%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body1">
            {shortNameEN}
          </Typography>
          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body1">
            {fullNameEN}
          </Typography>
        </div>
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top', width: '13%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body1">
            {shortNameFR}
          </Typography>
          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body1">
            {fullNameFR}
          </Typography>
        </div>
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top', width: '12%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Typography fontWeight={600} variant="body1">
            {route.path}
          </Typography>
          {pathParams.map(param => (
            <PathParamEntry key={param.key} param={param} />
          ))}
        </div>
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top', width: '12%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {searchParams.map(param => (
            <SearchParamEntry key={param.key} param={param} />
          ))}
        </div>
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top', width: '10%' }}>
        {hashParam && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <HashParamEntry param={hashParam} />
          </div>
        )}
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top', width: '9%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Typography color={route.disabled ? 'warning.main' : 'text.secondary'} variant="body2">
            {t('guard.disabled')}: {disabled}
          </Typography>
          <Typography color={route.forbidden ? 'error.main' : 'text.secondary'} variant="body2">
            {t('guard.forbidden')}: {forbidden}
          </Typography>
        </div>
      </TableCell>
      <TableCell align="right" sx={{ verticalAlign: 'top', width: '6%' }}>
        <Button size="small" variant="outlined">
          {t('header.action')}
        </Button>
      </TableCell>
    </TableRow>
  );
});

DevelopmentRoutesTableRow.displayName = 'DevelopmentRoutesTableRow';

//*****************************************************************************************
// Development Routes Table
//*****************************************************************************************

export type DevelopmentRoutesTableProps = {
  /** Table rows, one per registered route. */
  rows: DevelopmentRoutesTableRowData[];
};

export const DevelopmentRoutesTable = memo(({ rows }: DevelopmentRoutesTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'path', desc: false }]);
  const { t } = useTranslation('developmentRoutes');

  const columns = useMemo<ColumnDef<DevelopmentRoutesTableRowData, unknown>[]>(
    () => [
      { accessorKey: 'path', id: 'path', header: t('header.path'), enableSorting: true },
      { accessorKey: 'shortIcon', id: 'icon', header: t('header.icon'), enableSorting: false },
      { accessorKey: 'shortNameEN', id: 'nameEN', header: t('header.english'), enableSorting: false },
      { accessorKey: 'shortNameFR', id: 'nameFR', header: t('header.french'), enableSorting: false },
      { accessorKey: 'pathParams', id: 'pathParams', header: t('header.path_params'), enableSorting: false },
      { accessorKey: 'searchParams', id: 'searchParams', header: t('header.search_params'), enableSorting: false },
      { accessorKey: 'hashParam', id: 'hashParam', header: t('header.hash_param'), enableSorting: false },
      { accessorKey: 'disabled', id: 'guards', header: t('header.guard_functions'), enableSorting: false },
      { id: 'actions', header: t('header.action'), enableSorting: false }
    ],
    [t]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{t('header.path')}</TableCell>
            <TableCell colSpan={3} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              {t('header.metadata')}
            </TableCell>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{t('header.path_params')}</TableCell>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{t('header.search_params')}</TableCell>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{t('header.hash_param')}</TableCell>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{t('header.guard_functions')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              {t('header.action')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => {
            const original = row.original;

            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => {
                  const key = cell.column.id;
                  if (key === 'actions') {
                    return (
                      <TableCell key={key} align="right" sx={{ verticalAlign: 'top', width: '6%' }}>
                        <Button size="small" variant="outlined">
                          {t('header.action')}
                        </Button>
                      </TableCell>
                    );
                  }

                  if (key === 'path') {
                    return (
                      <TableCell key={key} sx={{ verticalAlign: 'top', width: '20%' }}>
                        <Typography fontWeight={600} variant="body1">
                          {original.path}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {original.ancestor}
                        </Typography>
                      </TableCell>
                    );
                  }

                  if (key === 'icon') {
                    return (
                      <TableCell key={key} sx={{ verticalAlign: 'top', width: '5%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
                            <span>{original.shortIcon}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
                            <span>{original.fullIcon}</span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  }

                  if (key === 'nameEN') {
                    return (
                      <TableCell key={key} sx={{ verticalAlign: 'top', width: '13%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body1">
                            {original.shortNameEN}
                          </Typography>
                          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body2">
                            {original.fullNameEN}
                          </Typography>
                        </div>
                      </TableCell>
                    );
                  }

                  if (key === 'nameFR') {
                    return (
                      <TableCell key={key} sx={{ verticalAlign: 'top', width: '13%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body1">
                            {original.shortNameFR}
                          </Typography>
                          <Typography noWrap sx={{ display: 'flex', alignItems: 'center', height: 32 }} variant="body2">
                            {original.fullNameFR}
                          </Typography>
                        </div>
                      </TableCell>
                    );
                  }

                  if (key === 'pathParams') {
                    return (
                      <TableCell key={key} sx={{ verticalAlign: 'top', width: '12%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <Typography fontWeight={600} variant="body1">
                            {original.path}
                          </Typography>
                          {original.pathParams.map(param => (
                            <PathParamEntry key={param.key} param={param} />
                          ))}
                        </div>
                      </TableCell>
                    );
                  }

                  if (key === 'searchParams') {
                    return (
                      <TableCell key={key} sx={{ verticalAlign: 'top', width: '12%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {original.searchParams.map(param => (
                            <SearchParamEntry key={param.key} param={param} />
                          ))}
                        </div>
                      </TableCell>
                    );
                  }

                  if (key === 'hashParam') {
                    return (
                      <TableCell key={key} sx={{ verticalAlign: 'top', width: '10%' }}>
                        {original.hashParam && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <HashParamEntry param={original.hashParam} />
                          </div>
                        )}
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={key} sx={{ verticalAlign: 'top', width: '9%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <Typography
                          color={original.disabled === '—' ? 'text.secondary' : 'warning.main'}
                          variant="body2"
                        >
                          {t('guard.disabled')}: {original.disabled}
                        </Typography>
                        <Typography
                          color={original.forbidden === '—' ? 'text.secondary' : 'error.main'}
                          variant="body2"
                        >
                          {t('guard.forbidden')}: {original.forbidden}
                        </Typography>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

DevelopmentRoutesTable.displayName = 'DevelopmentRoutesTable';
