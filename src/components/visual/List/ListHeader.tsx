import type { CheckboxProps } from '@mui/material';
import { Checkbox, ListItemIcon } from '@mui/material';
import type { AnchorProps } from 'components/core/TableOfContent/Anchor';
import { Anchor } from 'components/core/TableOfContent/Anchor';
import { StyledCircularSkeleton } from 'components/visual/Inputs/lib/inputs.components';
import {
  StyledListInputButtonRoot,
  StyledListInputText,
  StyledListItemRoot,
  StyledResetAdornment
} from 'components/visual/ListInputs/lib/listinputs.components';
import { usePropID, usePropLabel } from 'components/visual/ListInputs/lib/listinputs.hook';
import type { ListInputProps, ListInputValues } from 'components/visual/ListInputs/lib/listinputs.model';
import { PropProvider, usePropStore } from 'components/visual/ListInputs/lib/listinputs.provider';
import React from 'react';

export type ListHeaderProps = Omit<
  ListInputValues<boolean, boolean, React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>>,
  'value'
> &
  ListInputProps & {
    anchor?: boolean;
    anchorProps?: AnchorProps;
    checked?: boolean;
    edge?: CheckboxProps['edge'];
    indeterminate?: CheckboxProps['indeterminate'];
  };

const WrappedListHeader = React.memo(() => {
  const [get] = usePropStore<ListHeaderProps>();

  const anchor = get('anchor');
  const anchorProps = get('anchorProps');
  const checked = get('checked');
  const disabled = get('disabled');
  const edge = get('edge');
  const id = usePropID();
  const indeterminate = get('indeterminate');
  const loading = get('loading');
  const primary = usePropLabel();

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
    <PropProvider<ListHeaderProps> props={{ anchor, anchorProps, edge, preventRender, onChange: null, ...props }}>
      <WrappedListHeader />
    </PropProvider>
  );
};

ListHeader.displayName = 'ListHeader';
