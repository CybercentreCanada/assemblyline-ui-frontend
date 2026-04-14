import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Box, Button, Grid, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { useAppDrawer } from '@tui/drawer';

import type { FC, ReactNode } from 'react';

export type StepProps = {
  active?: boolean;
};

/**
 * A Step component used as part of the Accessibility Button component to notify the user how many options are associated with the button
 *
 * @param {boolean} [active] An optional field, it will change the color of the button to show an active or inactive state
 *
 * @returns {ReactNode} Returns a ReactNode component
 */
export const Step: FC<StepProps> = ({ active = true }) => {
  const theme = useTheme();

  return (
    <Grid
      size={3}
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          backgroundColor: active && theme.palette.success.main,
          borderColor: active
            ? theme.palette.success.main
            : theme.palette.mode === 'dark'
              ? theme.palette.common.white
              : theme.palette.common.black,
          height: theme.spacing(1),
          width: theme.spacing(5)
        }}
      />
    </Grid>
  );
};

export interface AccessibilityButtonProps {
  action: () => any;
  Icon: ReactNode;
  title: string;
  Steps?: ReactNode;
  tooltip?: string;
  active?: boolean;
}

/**
 * Render an Accessibility Button Component as part of the Accessibility Drawer.
 * These are interactive buttons meant to enhance the user experience by accommodating different disabilities.
 *
 * @param {() => void} action The action to occur when the accessibility button is interacted with
 * @param {ReactNode} Icon A ReactNode component for an icon to be display in the accessibility button
 * @param {string} title A human readable string to describe the function and purpose of the accessibility button
 * @param {Step} [Steps] An optional <code>Step</code> component or combination of <code>Step</code> components. Used to tell the user which option of the button they are on
 * @param {string} [tooltip] An optional tooltip text to provide more details on the accessibility button purpose and function
 * @param {boolean} [active] An optional field, used to hide/show a checkmark on the button as a way to notify the user that the button has changed a default setting of the application
 *
 * @returns {ReactNode} Returns a ReactNode component
 */
export const AccessibilityButton: FC<AccessibilityButtonProps> = ({
  action,
  Icon,
  title,
  Steps,
  tooltip,
  active = false
}) => {
  const drawer = useAppDrawer();

  return (
    <Grid textAlign="center" size={{ xs: 12, sm: 6, md: drawer.maximized ? 4 : 6, xl: drawer.maximized ? 2 : 4 }}>
      <Button variant="outlined" color="inherit" onClick={action} sx={{ width: '100%', position: 'relative' }}>
        <Stack>
          <Box pt={1} display="flex" justifyContent="center">
            {Icon}
          </Box>
          <Typography my={0.5}>{title}</Typography>
          {Steps && (
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={3}>
                <Step />
                {Steps}
              </Grid>
            </Box>
          )}
        </Stack>
        {tooltip && (
          <Tooltip title={tooltip}>
            <HelpOutlineOutlinedIcon sx={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }} />
          </Tooltip>
        )}
        {active && (
          <CheckCircleOutlineIcon color="success" sx={{ position: 'absolute', top: '0.25rem', left: '0.25rem' }} />
        )}
      </Button>
    </Grid>
  );
};
