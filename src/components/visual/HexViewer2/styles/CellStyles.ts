import { makeStyles } from '@material-ui/core';
import { yellow } from '@material-ui/core/colors';

export const useCellStyles = makeStyles(theme => ({
  hexBorder: {
    '& > div > div:nth-child(4n + 1):nth-child(n+2) ': {
      borderLeft: `1px solid ${theme.palette.text.hint}`
    }
  },
  border: {
    borderLeft: `1px solid ${theme.palette.text.hint}`
  },
  nullColor: {
    color: theme.palette.text.disabled
  },
  nonPrintableColor: {
    color: theme.palette.type === 'dark' ? 'rgb(203, 203, 99)' : 'rgb(184, 184, 16)'
  },
  lowerASCIIColor: {
    color: theme.palette.type === 'dark' ? 'rgb(153, 236, 255)' : 'rgb(0, 160, 196)'
  },
  higherASCIIColor: {
    color: theme.palette.type === 'dark' ? 'rgb(104, 152, 59)' : 'rgb(86, 178, 0)'
  },
  hover: {
    backgroundColor: theme.palette.action.selected
  },
  select: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.info.main,
    fontWeight: theme.palette.type === 'dark' ? 600 : 600
  },
  selectedSearch: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.warning.main,
    fontWeight: theme.palette.type === 'dark' ? 600 : 600
  },
  search: {
    color: theme.palette.common.black,
    backgroundColor: yellow[500],
    fontWeight: theme.palette.type === 'dark' ? 600 : 600
  },
  cursor: {
    fontWeight: theme.palette.type === 'dark' ? 400 : 600,
    backgroundColor: theme.palette.primary.light,
    color: 'white !important',
    animation: `1s $blink step-end infinite`
  },
  '@keyframes blink': {
    'from, to': {
      boxShadow: `inset 0 -4px 0 -2px ${theme.palette.primary.dark}`
    },
    '50%': {
      boxShadow: `none`
    }
  }
}));
