import { Box, Button, Divider, TextField, Typography, useTheme } from '@material-ui/core';
import { ChipList } from 'components/elements/mui/chips';
import React, { useState } from 'react';
import { AlertFavorite } from './useAlerts';

//
interface AlertsFiltersFavoritesProps {
  initValue?: string;
  favorites: AlertFavorite[];
  onSaveBtnClick: (favorite: { name: string; query: string }) => void;
  onCancelBtnClick: () => void;
  onFavoriteSelected: (favorite: { name: string; query: string }) => void;
  onFavoriteDelete: (favorite: { name: string; query: string }) => void;
}

const AlertsFiltersFavorites: React.FC<AlertsFiltersFavoritesProps> = ({
  initValue,
  favorites,
  onSaveBtnClick,
  onCancelBtnClick,
  onFavoriteSelected,
  onFavoriteDelete
}) => {
  const theme = useTheme();

  const [queryValue, setQueryValue] = useState<string>(initValue);
  const [nameValue, setNameValue] = useState<string>();

  const _onSaveBtnClick = () => {
    onSaveBtnClick({ query: queryValue, name: nameValue });
  };

  const _onCancelBtnClick = () => {
    onCancelBtnClick();
  };

  const onQueryChange = event => {
    setQueryValue(event.currentTarget.value);
  };

  const onNameChange = event => {
    setNameValue(event.currentTarget.value);
  };

  console.log(favorites);

  return (
    <Box>
      <Typography variant="h6">Add Favorites</Typography>
      <Divider />
      <Box mt={theme.spacing(0.4)} p={theme.spacing(0.1)}>
        <Box>
          <TextField label="Query" variant="outlined" value={queryValue} onChange={onQueryChange} fullWidth />
        </Box>
        <Box mt={2}>
          <TextField label="Name" variant="outlined" value={nameValue} onChange={onNameChange} fullWidth />
        </Box>
      </Box>
      <Box mt={1} display="flex" flexDirection="row">
        <Button variant="contained" color="primary" onClick={_onSaveBtnClick}>
          Save
        </Button>
        <Box flex={1} />
        <Button variant="contained" onClick={_onCancelBtnClick} size="small">
          Cancel
        </Button>
      </Box>
      <Box mb={2} />
      <Typography variant="h6">Your Favorites</Typography>
      <Divider />
      <Box m={1}>
        <ChipList
          items={favorites.map(f => ({
            size: 'medium',
            variant: 'outlined',
            label: f.query,
            onClick: () => onFavoriteSelected(f),
            onDelete: () => onFavoriteDelete(f)
          }))}
        />
      </Box>
    </Box>
  );
};

export default AlertsFiltersFavorites;
