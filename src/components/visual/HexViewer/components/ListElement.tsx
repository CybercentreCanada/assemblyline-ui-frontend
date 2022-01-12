import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { default as React } from 'react';

export type ListElementProps = {
  title: string;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const WrappedListElement = ({ title = '', icon = null, onClick = () => null }: ListElementProps) => {
  return (
    <ListItem button dense onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} />
    </ListItem>
  );
};

export const ListElement = React.memo(WrappedListElement);
export default ListElement;
