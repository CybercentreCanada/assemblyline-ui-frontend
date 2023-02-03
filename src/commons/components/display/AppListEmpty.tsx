import { Info } from '@mui/icons-material';
import { Box, Stack, StackProps, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function AppListEmpty(props: StackProps) {
  const { t } = useTranslation();
  return (
    <Stack
      {...props}
      direction="row"
      p={2}
      sx={theme => ({
        alignItems: 'center',
        color: theme.palette.text.secondary
      })}
    >
      <Info fontSize="large" />
      <Box m={1} />
      <Typography variant="h5">{t('app.list.empty')}</Typography>
    </Stack>
  );
}
