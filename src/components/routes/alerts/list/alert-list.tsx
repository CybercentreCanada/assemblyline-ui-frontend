import List from 'components/elements/lists/list';
import AlertListItem from 'components/routes/alerts/list/alert-list-item';
import { AlertItem } from 'components/routes/alerts/useAlerts';
import React from 'react';

type AlertListProps = {
  loading?: boolean;
  selected?: string | number;
  items: AlertItem[];
  onSelection: (item: AlertItem) => void;
  onKeyDown?: (keyCode: number, items: AlertItem[], selectedId: number | string) => void;
};

const AlertList: React.FC<AlertListProps> = ({ loading = true, selected = -1, items, onSelection, onKeyDown }) => {
  return (
    <List
      loading={loading}
      selected={selected}
      items={items}
      onItemSelected={onSelection}
      onRenderItem={i => <AlertListItem item={i} />}
      onKeyDown={onKeyDown}
    />
  );
};

export default AlertList;
