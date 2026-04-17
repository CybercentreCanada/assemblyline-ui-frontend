import type { FC } from 'react';
import type { LeftNavChildRenderProps, LeftNavSlotProps } from '.';
import { useAppLeftNav } from '../../app';

export const LeftNavSlot: FC<LeftNavSlotProps & LeftNavChildRenderProps> = props => {
  const { open: navopen } = useAppLeftNav();

  if (props.render) {
    return props.render(navopen, props);
  }

  if (!props.component) {
    throw new Error('LeftNavSlot: either "render" or "component" prop must be provided.');
  }

  return props.withProps ? <props.component {...props} /> : <props.component />;
};
