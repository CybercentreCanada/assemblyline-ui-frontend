import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton } from '@mui/material';
import useList from 'commons_deprecated/addons/elements/lists/hooks/useListNavigator';

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
      <IconButton onClick={onPreviousItem} size="large">
        <ChevronLeftIcon />
      </IconButton>
      <IconButton onClick={onNextItem} size="large">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default ListNavigator;
