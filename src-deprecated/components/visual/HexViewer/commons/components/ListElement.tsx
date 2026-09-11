import { ListItemButton } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { default as React } from 'react';

export type ListElementProps = {
  title: string;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const WrappedListElement = ({ title = '', icon = null, onClick = () => null }: ListElementProps) => {
  return (
    <ListItemButton dense onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} />
    </ListItemButton>
  );
};

export const ListElement = React.memo(WrappedListElement);
export default ListElement;
