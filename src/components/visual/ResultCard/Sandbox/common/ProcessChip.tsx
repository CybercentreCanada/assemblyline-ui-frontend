import { alpha, Typography, useTheme } from '@mui/material';
import type { SandboxProcessItem } from 'components/models/base/result_body';
import React from 'react';

export type ProcessChipProps = {
  process: SandboxProcessItem;
  short?: boolean;
  fullWidth?: boolean;
};

export const ProcessChip = React.memo(({ process, short = false, fullWidth = false }: ProcessChipProps) => {
  const theme = useTheme();

  if (!process) return null;

  const imageName = process.image?.split(/[/\\]/).pop() ?? '';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto auto',
        alignItems: 'start',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        margin: theme.spacing(0.5),
        ...(!fullWidth && { width: 'max-content' })
      }}
    >
      <Typography
        component="div"
        fontSize="inherit"
        variant="body2"
        sx={{
          gridRow: '1 / span 2',
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 0.5,
          backgroundColor: alpha(theme.palette.grey[800], 0.5),
          whiteSpace: 'nowrap',
          borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`
        }}
      >
        {process.pid}
      </Typography>

      <Typography
        fontSize="inherit"
        fontWeight={500}
        sx={{
          px: 1,
          whiteSpace: 'nowrap',
          wordBreak: 'inherit'
        }}
      >
        {imageName}
      </Typography>

      {!short && (
        <Typography
          color="textSecondary"
          fontSize="inherit"
          sx={{
            px: 1,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere'
          }}
        >
          {process?.command_line}
        </Typography>
      )}
    </div>
  );
});
