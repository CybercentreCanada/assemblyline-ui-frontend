import { Box, Stack, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

export const ThinkingBadge = () => {
  const [dots, setDots] = useState<string[]>(['']);
  const theme = useTheme();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots(_dots => {
        if (_dots.length === 3) {
          return [];
        }
        return [..._dots, ''];
      });
    }, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Stack direction="row" style={{ width: theme.spacing(4.5) }} alignItems="center">
      {dots.map((d, i) => (
        <Box
          key={i}
          style={{
            marginTop: 8,
            backgroundColor: theme.palette.secondary.main,
            borderRadius: '50%',
            width: 8,
            height: 8,
            marginRight: i < dots.length - 1 && 4
          }}
        />
      ))}
    </Stack>
  );
};
