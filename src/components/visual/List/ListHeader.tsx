import type { CheckboxProps } from '@mui/material';
import { Checkbox, ListItemIcon } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import type { AnchorProps } from 'components/core/TableOfContent/Anchor';
import { Anchor } from 'components/core/TableOfContent/Anchor';
import { useInputId, useInputLabel } frocomponents/visual/Inputs/components/inputs.components;
import { StyledCircularSkeleton } from 'components/visual/Inputs/lib/inputs.components';
import type { InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import {
  StyledListInputButtonRoot,
  StyledListInputText,
  StyledListItemRoot,
  StyledResetAdornment
} from 'components/visual/ListInputs/lib/listinputs.components';
import type { ListInputOptions } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type ListHeaderProps = Omit<
  InputValueModel<boolean, boolean, React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>>,
  'value'
> &
  ListInputOptions & {
    anchor?: boolean;
    anchorProps?: AnchorProps;
    checked?: boolean;
    edge?: CheckboxProps['edge'];
    indeterminate?: CheckboxProps['indeterminate'];
  };

type ListHeaderController = ListHeaderProps & {};

const WrappedListHeader = React.memo(() => {
  const [get] = usePropStore<ListHeaderController>();

  const anchor = get('anchor');
  const anchorProps = get('anchorProps');
  const checked = get('checked');
  const disabled = get('disabled');
  const edge = get('edge');
  const id = useInputId();
  const indeterminate = get('indeterminate');
  const loading = get('loading');
  const primary = useInputLabel();

  const onChange = get('onChange');

  return (
    <Anchor anchor={id} label={primary} disabled={!anchor} {...anchorProps}>
      {!onChange ? (
        <StyledListItemRoot dense disableGutters disablePadding sx={{ padding: 0 }}>
          {checked !== null && checked !== undefined && (
            <ListItemIcon>
              {loading ? (
                <StyledCircularSkeleton />
              ) : (
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  disableRipple
                  edge={edge}
                  indeterminate={indeterminate}
                  inputProps={{ id }}
                  tabIndex={-1}
                />
              )}
            </ListItemIcon>
          )}
          <StyledListInputText />
        </StyledListItemRoot>
      ) : (
        <StyledListInputButtonRoot
          dense
          disableGutters
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onChange(event, checked, indeterminate);
          }}
          sx={{ padding: 0 }}
        >
          {checked !== null && checked !== undefined && (
            <ListItemIcon>
              {loading ? (
                <StyledCircularSkeleton />
              ) : (
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  disableRipple
                  edge={edge}
                  indeterminate={indeterminate}
                  inputProps={{ id }}
                  tabIndex={-1}
                />
              )}
            </ListItemIcon>
          )}

          <StyledListInputText />

          <StyledResetAdornment />
        </StyledListInputButtonRoot>
      )}
    </Anchor>
  );
});

export const ListHeader = ({
  anchor = false,
  anchorProps = null,
  edge = 'end',
  preventRender = false,
  ...props
}: ListHeaderProps) => {
  return preventRender ? null : (
    <PropProvider<ListHeaderController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as ListHeaderController}
      props={{ anchor, anchorProps, edge, preventRender, onChange: null, ...props }}
    >
      <WrappedListHeader />
    </PropProvider>
  );
};

ListHeader.displayName = 'ListHeader';
