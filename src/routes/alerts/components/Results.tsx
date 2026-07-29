import { Button, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { useAppSearchSnapshot } from 'core/routes';
import type { FC, ReactNode } from 'react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFilter } from 'react-icons/fi';
import type { AlertSearchParams } from 'routes/alerts/alerts.route';
import AlertsFiltersSelected from 'routes/alerts/components/FiltersSelected';

type SearchCountProps = {
  children?: ReactNode;
  loading?: boolean;
  max?: number;
  suffix?: string;
  total?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const SearchCount: FC<SearchCountProps> = memo(
  ({ children = null, loading = false, suffix = '', total = 0, max = 10000, onClick }: SearchCountProps) => {
    const { t } = useTranslation();

    const [open, setOpen] = useState<boolean>(false);

    const formattedTotal = useMemo<string>(
      () => (!total ? '0' : total.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ' ')),
      [total]
    );

    const isLimited = useMemo<boolean>(() => total >= max, [max, total]);

    const disabled = useMemo<boolean>(() => loading || !isLimited, [isLimited, loading]);

    return (
      <Tooltip
        title={t('full_count')}
        open={open && !disabled}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <div>
          <Button
            size="small"
            disableElevation={disabled}
            disableRipple={disabled}
            style={{ padding: '0px', ...(disabled && { backgroundColor: 'transparent', cursor: 'default' }) }}
            onClick={disabled ? null : onClick}
          >
            {children}
            <Typography
              color="primary"
              fontStyle="italic"
              textTransform="none"
              variant="subtitle1"
              whiteSpace="nowrap"
              children={loading ? t('searching') : `${formattedTotal}${isLimited ? '+' : ''} ${suffix}`}
            />
          </Button>
        </div>
      </Tooltip>
    );
  }
);

type Props = {
  loading: boolean;
  total: number;
};

const WrappedAlertSearchResults: React.FC<Props> = ({ loading = false, total = 0 }: Props) => {
  const { t } = useTranslation(['alerts']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/alerts'>();
  const search = useAppSearchSnapshot<'/alerts'>();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleChange = useCallback(
    (value: AlertSearchParams) => navigate.here<'/alerts'>().update(s => ({ ...s, search: { ...value, offset: 0 } })),
    [navigate]
  );

  if (isMDUp)
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          columnGap: theme.spacing(1),
          marginTop: theme.spacing(1),
          minHeight: theme.spacing(3)
        }}
      >
        <AlertsFiltersSelected
          value={search.toObject()}
          onChange={handleChange}
          visible={['fq', 'group_by', 'sort', 'tc']}
        />
        <div style={{ flex: 1 }} />
        <SearchCount
          loading={loading}
          total={total}
          max={search.get('track_total_hits')}
          suffix={total > 1 ? t('results') : t('result')}
          onClick={() =>
            navigate.here<'/alerts'>().update(s => ({
              ...s,
              search: {
                ...s.search,
                offset: 0,
                track_total_hits: s.search.track_total_hits === null ? 10000000 : null
              }
            }))
          }
        />
      </div>
    );
  else
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          columnGap: theme.spacing(1),
          marginTop: theme.spacing(1),
          minHeight: theme.spacing(3)
        }}
      >
        <SearchCount
          loading={loading}
          total={total}
          max={search.get('track_total_hits')}
          suffix={total > 1 ? t('results') : t('result')}
          onClick={() =>
            navigate.here<'/alerts'>().update(s => ({
              ...s,
              search: {
                ...s.search,
                offset: 0,
                track_total_hits: s.search.track_total_hits === null ? 10000000 : null
              }
            }))
          }
        >
          {search.toObject().fq.length > 0 && <FiFilter />}
        </SearchCount>
      </div>
    );
};

export const AlertSearchResults = React.memo(WrappedAlertSearchResults);
