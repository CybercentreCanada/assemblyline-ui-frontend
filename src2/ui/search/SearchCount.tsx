import { Button, Tooltip, Typography } from '@mui/material';
import type { MouseEventHandler, ReactNode } from 'react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const TOTAL_TRACKED_RECORDS = 10000;

type SearchCountProps = {
  children?: ReactNode;
  currentMax?: number;
  defaultMax?: number;
  disabled?: boolean;
  loading?: boolean;
  suffix?: ReactNode;
  total?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const WrappedSearchCount = memo(
  ({
    children = null,
    currentMax = TOTAL_TRACKED_RECORDS,
    defaultMax = TOTAL_TRACKED_RECORDS,
    disabled: disabledProp = false,
    loading = false,
    suffix = '',
    total = 0,
    onClick
  }: SearchCountProps) => {
    const { t } = useTranslation();

    const [open, setOpen] = useState<boolean>(false);

    const formattedTotal = useMemo<string>(
      () => (!total ? '0' : total.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ' ')),
      [total]
    );

    const isLimited = useMemo<boolean>(() => total >= currentMax, [currentMax, total]);

    const disabled = useMemo<boolean>(
      () => loading || disabledProp || total < defaultMax,
      [defaultMax, disabledProp, loading, total]
    );

    return (
      <Tooltip
        open={open && !disabled}
        title={t('full_count')}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <Button
          disableElevation={disabled}
          disableRipple={disabled}
          size="small"
          style={{ padding: '0px', ...(disabled && { backgroundColor: 'transparent', cursor: 'default' }) }}
          onClick={disabled ? null : onClick}
        >
          {children}
          <Typography
            children={
              loading ? (
                <>{t('searching')}</>
              ) : (
                <>
                  {formattedTotal}
                  {isLimited ? '+' : ''} {suffix}
                </>
              )
            }
            color="secondary"
            fontStyle="italic"
            textTransform="none"
            variant="subtitle1"
            whiteSpace="nowrap"
          />
        </Button>
      </Tooltip>
    );
  }
);

export const SearchCount = memo(WrappedSearchCount);

SearchCount.displayName = 'SearchCount';
