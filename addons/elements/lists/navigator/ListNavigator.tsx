import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton } from '@mui/material';
import useListNavigator from 'commons/addons/elements/lists/hooks/useListNavigator';

const ListNavigator = ({ id }) => {
  const { selectNext, selectPrevious } = useListNavigator(id);
  return (
    <Box display="flex" alignItems="center">
      <IconButton onClick={selectPrevious} size="large">
        <ChevronLeftIcon />
      </IconButton>
      <IconButton onClick={selectNext} size="large">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default ListNavigator;
