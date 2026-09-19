import { MenuList } from '@mui/material';
import { darken, lighten, styled } from '@mui/material/styles';

export const Container = styled('div')(() => ({
  position: 'relative',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%',
  outline: 'none'
}));

export const Header = styled('div')(() => ({
  display: 'flex'
}));

export const HeaderCell = styled('div')<{ hover?: boolean; divider?: boolean }>(({ theme, hover, divider }) => ({
  position: 'relative',
  flexGrow: 0,
  textAlign: 'left',
  paddingTop: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  border: '1px solid',
  borderColor: 'transparent',
  '&:hover $headerCellMenuBtn': {
    display: 'inherit',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.05)
        : darken(theme.palette.background.default, 0.05)
  },
  '&[data-menuopen="true"]': {
    border: '1px dashed',
    borderColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.3)
        : darken(theme.palette.background.default, 0.3),
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.05)
        : darken(theme.palette.background.default, 0.05)
  },

  ...(hover && {
    '& $actions': {
      display: 'none',
      verticalAlign: 'center'
    },
    '&:hover': {
      cursor: 'pointer',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.05)
          : darken(theme.palette.background.default, 0.05)
    },
    '&:hover $actions': {
      display: 'inherit'
    }
  }),

  ...(divider && {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider
  })
}));

export const HeaderCellMenuBtn = styled('div')(({ theme }) => ({
  display: 'none',
  position: 'absolute',
  top: theme.spacing(0.5),
  right: theme.spacing(0.5)
}));

export const HeaderCellMenuPopper = styled(MenuList)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  backgroundColor:
    theme.palette.mode === 'dark' ? lighten(theme.palette.background.default, 0.1) : theme.palette.background.default
}));

export const BodyOuter = styled('div')(({ theme }) => ({
  position: 'relative',
  flex: 1
}));

export const BodyInnerFlex = styled('div')<{ flex?: boolean }>(({ theme, flex = false }) => ({
  ...(flex && { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'auto' })
}));

export const Row = styled('div')(() => ({}));

export const RowInner = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box'
}));

export const Cell = styled('div')(({ theme }) => ({
  flex: 1,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}));

export const Top = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center'
  // paddingBottom: theme.spacing(1)
}));

export const FilterSelectorWrap = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

export const FilterListWrap = styled('div')(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

export const Item = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&[data-listitem-focus="true"]': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.25)
        : darken(theme.palette.background.default, 0.25)
  },
  '&[data-listitem-selected="true"]': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.025)
        : darken(theme.palette.background.default, 0.025)
  }
}));

export const ItemDivider = styled('div')(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider
}));

export const ItemHover = styled('div')(({ theme }) => ({
  '& $actions': {
    display: 'none',
    verticalAlign: 'center'
  },
  '&:hover': {
    cursor: 'pointer',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.05)
        : darken(theme.palette.background.default, 0.05)
  },
  '&:hover $actions': {
    display: 'inherit'
  }
}));

export const Children = styled('div')(() => ({}));

export const Actions = styled('div')(() => ({
  position: 'absolute',
  right: 0,
  backgroundColor: 'inherit',
  margin: 'auto'
}));
