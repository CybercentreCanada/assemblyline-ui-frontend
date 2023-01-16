import { yellow } from '@mui/material/colors';
import makeStyles from '@mui/styles/makeStyles';

export const useCellStyles = makeStyles(theme => ({
  hexBorder: {
    '& > div > div:nth-child(4n + 1):nth-child(n+2) ': {
      borderLeft: `1px solid ${theme.palette.text.secondary}`
    }
  },
  border: {
    borderLeft: `1px solid ${theme.palette.text.secondary}`
  },
  nullColor: {
    color: theme.palette.text.disabled
  },
  nonPrintableColor: {
    color: theme.palette.mode === 'dark' ? 'rgb(203, 203, 99)' : 'rgb(229, 185, 94)'
  },
  lowerASCIIColor: {
    color: theme.palette.mode === 'dark' ? 'rgb(153, 236, 255)' : 'rgb(55, 161, 223)'
  },
  higherASCIIColor: {
    color: theme.palette.mode === 'dark' ? 'rgb(104, 152, 59)' : 'rgb(36, 128, 0)'
  },
  hover: {
    backgroundColor: theme.palette.action.selected
  },
  search: {
    color: theme.palette.common.black,
    backgroundColor: yellow[500],
    opacity: 0.9,
    fontWeight: theme.palette.mode === 'dark' ? 600 : 600
  },
  selectedSearch: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.warning.main,
    opacity: 0.9,
    fontWeight: theme.palette.mode === 'dark' ? 600 : 600
  },
  select: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.info.main,
    opacity: 0.9,
    fontWeight: theme.palette.mode === 'dark' ? 600 : 600
  },
  cursor: {
    fontWeight: theme.palette.mode === 'dark' ? 400 : 600,
    backgroundColor: theme.palette.primary.light,
    opacity: 0.9,
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
