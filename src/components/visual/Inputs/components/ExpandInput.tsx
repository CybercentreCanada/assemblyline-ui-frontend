import { ExpandMore } from '@mui/icons-material';
import { IconButton, ListItemIcon, useTheme } from '@mui/material';
import { getAriaLabel, usePreventExpand } from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';

export type ExpandInputProps<T> = {
  props: InputProps<T>;
};

export const ExpandInput = <T,>({ props }: ExpandInputProps<T>) => {
  const theme = useTheme();

  const preventRender = usePreventExpand(props);

  const { onExpand, expandProps } = props;

  return preventRender ? null : (
    <ListItemIcon sx={{ minWidth: 0 }}>
      <IconButton
        aria-label={`${getAriaLabel(props)}-expand`}
        type="button"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onExpand(event);
        }}
        {...expandProps}
      >
        <ExpandMore
          fontSize="small"
          sx={{
            transition: theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest
            }),
            transform: 'rotate(0deg)',
            ...(open && { transform: 'rotate(180deg)' })
          }}
        />
      </IconButton>
    </ListItemIcon>
  );
};
