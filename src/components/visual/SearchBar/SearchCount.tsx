import { Button, Tooltip, Typography } from '@mui/material';
import type { FC, ReactNode } from 'react';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SearchCountProps = {
  children?: ReactNode;
  loading?: boolean;
  max?: number;
  suffix?: ReactNode;
  total?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const WrappedSearchCount: FC<SearchCountProps> = memo(
  ({ children = null, loading = false, max = 10000, suffix = '', total = 0, onClick }: SearchCountProps) => {
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
        open={open && !disabled}
        title={t('full_count')}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <div>
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
        </div>
      </Tooltip>
    );
  }
);

export const SearchCount = React.memo(WrappedSearchCount);
export default SearchCount;
