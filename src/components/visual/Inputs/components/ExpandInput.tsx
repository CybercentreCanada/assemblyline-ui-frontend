import { ExpandMore } from '@mui/icons-material';
import { IconButton, ListItemIcon, useTheme } from '@mui/material';
import type { useInputState } from 'components/visual/Inputs/components/InputComponents';
import type { InputProps } from 'components/visual/Inputs/models/Input';

export type ExpandInputProps<T, P> = {
  props: InputProps<T>;
  state: ReturnType<typeof useInputState<T, P>>;
};

export const ExpandInput = <T, P>({ props, state }: ExpandInputProps<T, P>) => {
  const theme = useTheme();

  const { id, preventExpandRender } = state;
  const { expand = null, onExpand = () => null, expandProps } = props;

  return preventExpandRender ? null : (
    <ListItemIcon sx={{ minWidth: 0 }}>
      <IconButton
        aria-label={`${id}-expand`}
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
            ...(expand && { transform: 'rotate(180deg)' })
          }}
        />
      </IconButton>
    </ListItemIcon>
  );
};
