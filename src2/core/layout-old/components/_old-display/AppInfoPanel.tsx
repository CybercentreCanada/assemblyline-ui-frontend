import { Info } from '@mui/icons-material';
import { Box, emphasize, Stack, type StackProps, Typography, useTheme } from '@mui/material';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MODULE_NAME } from '../name';

export type AppInfoPanelProps = { i18nKey: string } & StackProps;

export const AppInfoPanel: FC<AppInfoPanelProps> = ({ i18nKey, ...props }) => {
  const { t } = useTranslation(MODULE_NAME);
  const theme = useTheme();
  const bgColor = emphasize(theme.palette.background.default, 0.1);
  const color = emphasize(bgColor, 0.4);
  return (
    <Stack
      {...props}
      direction="row"
      p={2}
      sx={{
        ...props.sx,
        alignItems: 'center',
        borderRadius: 2,
        backgroundColor: bgColor,
        color: color
      }}
    >
      <Info fontSize="large" />
      <Box m={1} />
      <Typography variant="h5">{t(i18nKey)}</Typography>
    </Stack>
  );
};
