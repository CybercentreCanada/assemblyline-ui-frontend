import { Divider, Stack, useTheme } from '@mui/material';
import { type ItemComponentProps } from 'commons/components/app/AppNotificationService';
import { type FeedItem } from 'commons/components/notification';
import { NotificationEndOfPage } from 'commons/components/notification/elements/NotificationEndOfPage';
import { NotificationError } from 'commons/components/notification/elements/NotificationError';
import { NotificationSkeleton } from 'commons/components/notification/elements/NotificationSkeleton';
import { type FC, memo } from 'react';

type NotificationListsProps = {
  notifications: FeedItem[];
  ItemComponent: FC<ItemComponentProps>;
  pageSize?: number;
  handleLoading: () => void;
  status: string;
};

export const NotificationItems: FC<NotificationListsProps> = memo(
  ({ notifications = [], handleLoading = () => null, pageSize = 10, ItemComponent = null, status = 'loading' }) => {
    const theme = useTheme();

    return status === 'loading' ? (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <NotificationSkeleton key={`skeleton-${i}`} />
        ))}
      </>
    ) : status === 'error' ? (
      <NotificationError />
    ) : (
      status === 'ready' && (
        <>
          <Stack
            direction="column"
            spacing={theme.spacing(1.25)}
            margin={theme.spacing(1.25)}
            divider={<Divider orientation="horizontal" flexItem style={{ width: '100%', alignSelf: 'center' }} />}
          >
            {notifications.slice(0, pageSize).map(n => (
              <ItemComponent key={n?.title} item={n} />
            ))}
          </Stack>
          <NotificationEndOfPage endOfPage={pageSize >= notifications.length} onLoading={() => handleLoading()} />
        </>
      )
    );
  }
);
