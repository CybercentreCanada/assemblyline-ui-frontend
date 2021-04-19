import { Box, IconButton } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import useList from 'commons/addons/elements/lists/hooks/useListNavigator';

const ListNavigator = ({ id }) => {
  const { selectNext, selectPrevious } = useList(id);

  const onNextItem = () => {
    selectNext();
  };

  const onPreviousItem = () => {
    selectPrevious();
  };

  return (
    <Box display="flex" alignItems="center">
      <IconButton onClick={onPreviousItem}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton onClick={onNextItem}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default ListNavigator;
