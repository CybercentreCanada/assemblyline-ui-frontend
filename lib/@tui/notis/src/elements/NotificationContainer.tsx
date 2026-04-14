import { FeedbackOutlined } from '@mui/icons-material';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';
import { type FC, memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ItemComponentProps } from '../AppNotificationService';
import { type FeedItem } from '../FeedModels';
import { MODULE_NAME } from '../name';
import { NotificationCloseButton } from './NotificationCloseButton';
import { NotificationHeader } from './NotificationHeader';
import { NotificationItems } from './NotificationItems';

export type NotificationProps = {
  notifications: FeedItem[];
  ItemComponent: FC<ItemComponentProps>;
  drawer?: boolean;
  initialPageSize?: number;
  loadingPageDelta?: number;
  onDrawerOpen?: () => void;
  onDrawerClose?: () => void;
  inDrawer?: boolean;
  status: string;
  maxDrawerWidth: string;
};

export const NotificationContainer: FC<NotificationProps> = memo(props => {
  const {
    notifications = [],
    drawer = true,
    onDrawerOpen = () => null,
    onDrawerClose = () => null,
    initialPageSize = 10,
    loadingPageDelta = 2,
    ItemComponent = null,
    inDrawer = true,
    status = 'loading',
    maxDrawerWidth = '500px'
  } = props;

  const { t } = useTranslation(MODULE_NAME);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const handleLoading = useCallback(() => {
    setPageSize(v => v + loadingPageDelta);
  }, [loadingPageDelta]);

  return inDrawer ? (
    <Drawer
      elevation={2}
      anchor="right"
      open={drawer}
      onClick={() => (drawer ? onDrawerClose() : onDrawerOpen())}
      slotProps={{
        paper: { style: { width: upSM ? '80%' : '100%', maxWidth: maxDrawerWidth } }
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          overflowX: 'hidden',
          pageBreakBefore: 'avoid',
          pageBreakInside: 'avoid',
          padding: theme.spacing(2.5),
          paddingTop: 0
        }}
      >
        <NotificationHeader icon={<FeedbackOutlined />} title={t('notification.title')}>
          <NotificationCloseButton {...props} />
        </NotificationHeader>
        <NotificationItems
          status={status}
          notifications={notifications}
          pageSize={pageSize}
          handleLoading={handleLoading}
          ItemComponent={ItemComponent}
        />
      </div>
    </Drawer>
  ) : (
    <NotificationItems
      notifications={notifications}
      pageSize={pageSize}
      handleLoading={handleLoading}
      ItemComponent={ItemComponent}
      status={status}
    />
  );
});
