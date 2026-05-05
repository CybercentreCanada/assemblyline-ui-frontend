import { useTheme } from '@mui/material';
import { memo, useEffect, useState } from 'react';

//*****************************************************************************************
// ThinkingBadge
//*****************************************************************************************

export const ThinkingBadge = memo(() => {
  const theme = useTheme();
  const [dots, setDots] = useState<string[]>(['']);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots(prev => (prev.length === 3 ? [] : [...prev, '']));
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: theme.spacing(4.5), alignItems: 'center' }}>
      {dots.map((_, i) => (
        <div
          key={i}
          style={{
            marginTop: 8,
            backgroundColor: theme.palette.secondary.main,
            borderRadius: '50%',
            width: 8,
            height: 8,
            marginRight: i < dots.length - 1 ? 4 : 0
          }}
        />
      ))}
    </div>
  );
});

ThinkingBadge.displayName = 'ThinkingBadge';
