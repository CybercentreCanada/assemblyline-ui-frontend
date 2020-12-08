/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import useListStyles from 'commons/addons/elements/lists/hooks/useListStyles';
import ListItemBase, { ListItemBaseProps } from 'commons/addons/elements/lists/item/ListItemBase';
import React from 'react';

interface MetaListItemProps extends ListItemBaseProps {
  loaded: boolean;
}

const MetaListItem: React.FC<MetaListItemProps> = React.memo(props => {
  const { listItemClasses: classes } = useListStyles();
  const { loaded, height, children } = props;
  return (
    <ListItemBase {...props}>
      {item => (
        <div className={classes.itemOuter} style={{ height }}>
          <div className={classes.itemInner}>{loaded ? children(item) : '...loading'}</div>
        </div>
      )}
    </ListItemBase>
  );
});

export default MetaListItem;
