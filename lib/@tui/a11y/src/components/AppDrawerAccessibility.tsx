import { AccessibilityNew, CachedOutlined } from '@mui/icons-material';
import { Box, Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { PageContent } from '@tui/core';
import { useAppDrawer } from '@tui/drawer';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MODULE_NAME } from '..';
import {
  useAppAccessibilityFeatures,
  useAppAccessibilityPreferences,
  useAppAccessibilityStates,
  useAppKeyboardShortcut
} from '../hooks';

const AccessibilityDrawer = () => {
  const accessibilityStates = useAppAccessibilityStates();
  const accessibilityButtons = useAppAccessibilityFeatures();
  const { t } = useTranslation(MODULE_NAME);

  return (
    <PageContent>
      {/* Render drawer title bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          paddingLeft: '1rem',
          alignContent: 'center'
        }}
      >
        <Typography fontSize="1.75rem !important">{t('accessibilitymenu')}</Typography>
      </Box>

      <Grid container spacing={1} justifyContent="center">
        {/* Attempt to render all accessibility buttons */}
        {accessibilityButtons.map(AccessibilityButton => AccessibilityButton)}

        {/* Render reset button */}
        <Grid size={12} sx={{ flexGrow: 1, textAlign: 'center', mt: 2 }}>
          <Button
            onClick={accessibilityStates?.resetToDefault}
            variant="outlined"
            color="inherit"
            size="large"
            startIcon={<CachedOutlined />}
          >
            <Typography>{t('accessibilitymenu.title')}</Typography>
          </Button>
        </Grid>
      </Grid>
    </PageContent>
  );
};

export const AppDrawerAccessibilityIconButton = () => {
  const drawer = useAppDrawer();
  const accessibilityPreferences = useAppAccessibilityPreferences();
  const { t } = useTranslation(MODULE_NAME);

  const openDrawer = useCallback(
    () => drawer.open({ id: 'tui.app.drawer.accessibility', mode: 'float', element: <AccessibilityDrawer /> }),
    [drawer]
  );

  const closeDrawer = useCallback(() => {
    if (drawer.id === 'tui.app.drawer.accessibility') {
      drawer.close();
    }
  }, [drawer]);

  useAppKeyboardShortcut({
    key: 'u',
    expectControl: true,
    onKeyPressed: openDrawer
  });

  useAppKeyboardShortcut({
    key: 'Escape',
    expectControl: false,
    onKeyPressed: closeDrawer
  });

  return (
    accessibilityPreferences?.enableAccessibility && (
      <Tooltip title={t('accessibilitymenu.tooltip')}>
        <IconButton color="inherit" onClick={openDrawer} size="large" aria-label={t('accessibilitymenu.tooltip')}>
          <AccessibilityNew />
        </IconButton>
      </Tooltip>
    )
  );
};
