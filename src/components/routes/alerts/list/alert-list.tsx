import List, { ListPage } from 'components/elements/list';
import AlertListItem from 'components/routes/alerts/list/alert-list-item';
import { AlertItem } from 'components/routes/alerts/useAlerts';
import React from 'react';

type AlertListProps = {
  loading?: boolean;
  selected?: string | number;
  page: ListPage<AlertItem>;
  onSelection: (item: AlertItem) => void;
  onKeyDown?: (keyCode: number, page: ListPage<AlertItem>, selectedId: number | string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

const AlertList: React.FC<AlertListProps> = ({
  loading = true,
  selected = -1,
  page,
  onSelection,
  onKeyDown,
  onNextPage,
  onPreviousPage
}) => {
  return (
    <List
      loading={loading}
      selected={selected}
      page={page}
      onItemSelected={onSelection}
      onRenderItem={i => <AlertListItem item={i} />}
      onKeyDown={onKeyDown}
      onNextPage={onNextPage}
      onPreviousPage={onPreviousPage}
    />
  );
};

export default AlertList;
