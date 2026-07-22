import { Box, styled, useTheme } from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';

export const Performance = ({ method, children }) => {
  const form = useForm();

  // Save the start time before the component renders
  const startRenderTime = performance.now();

  useEffect(() => {
    // Measure the end time after the component has mounted
    const endRenderTime = performance.now();
    const timeToRender = endRenderTime - startRenderTime;

    // Update the state with the time to render in milliseconds
    form.setFieldValue('performances', p => ({ ...p, [method]: timeToRender.toFixed(2) }));
  }, [method]); // Empty dependency array ensures this only runs once after mount

  return children;
};

export const StyledDiv = ({ children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        color: theme.palette.text.secondary,
        border: `1px solid ${theme.palette.text.secondary}`,
        borderRadius: theme.spacing(0.5),
        margin: theme.spacing(0.5),
        padding: theme.spacing(0.5)
      }}
    >
      {children}
    </div>
  );
};

export const StyledDiv2 = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.text.secondary}`,
  borderRadius: theme.spacing(0.5),
  margin: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.primary.main
  }
}));

export const StyledBox2 = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.text.secondary}`,
  borderRadius: theme.spacing(0.5),
  margin: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.primary.main
  }
}));
