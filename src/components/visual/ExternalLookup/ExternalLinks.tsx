import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Box, Link, Popover, SvgIconTypeMap, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useExternalLookup from 'components/hooks/useExternalLookup';
import { toTitleCase } from 'helpers/utils';
import React, { forwardRef } from 'react';

const useStyles = makeStyles(theme => ({
  link: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    textDecoration: 'none'
  },
  title: {
    flex: 1,
    fontWeight: 500,
    color: theme.palette.text.primary
  },
  content: {
    flex: 1,
    fontWeight: 400,
    color: theme.palette.primary.main
  },
  error: {
    flex: 1,
    fontWeight: 400,
    color: theme.palette.text.primary,
    fontSize: 'small'
  },
  launch: {
    color: theme.palette.primary.main,
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  },
  popover: {
    pointerEvents: 'none'
  },
  popoverContent: {
    pointerEvents: 'auto'
  }
}));

type LookupSourceDetails = {
  link: string;
  count: number;
  classification: string;
};

type ExternalLookupProps = {
  category: string;
  type: string;
  value: string;
  iconStyle?: null | Object;
};

// This needs to be taken out into it's own `forwardRef` to enable ref to be
// passed onto the Icon for hover popover to work
const EXTERNAL_RESULTS_ICON = forwardRef<SvgIconTypeMap | null, any>((props, ref) => {
  const { success, iconHeight, ...remainingProps } = props;
  return (
    <>
      {success === true && <LinkOutlinedIcon ref={ref} {...remainingProps} />}
      {success === false && <ErrorOutlineOutlinedIcon ref={ref} {...remainingProps} />}
    </>
  );
});

const WrappedExternalLinks: React.FC<ExternalLookupProps> = ({ category, type, value, iconStyle }) => {
  const classes = useStyles();
  const [openedPopover, setOpenedPopover] = React.useState(false);
  const popoverAnchor = React.useRef(null);

  const popoverEnter = ({ currentTarget }) => {
    setOpenedPopover(true);
  };

  const popoverLeave = ({ currentTarget }) => {
    setOpenedPopover(false);
  };

  const { lookupState, isActionable, getKey } = useExternalLookup();
  const actionable = isActionable(category, type, value);
  const externalLookupResults = lookupState[getKey(type, value)];
  const id = openedPopover ? 'external-result-popover' : undefined;

  return actionable && externalLookupResults ? (
    <div>
      {externalLookupResults.success !== null ? (
        <EXTERNAL_RESULTS_ICON
          success={externalLookupResults.success}
          style={iconStyle}
          aria-owns={id}
          aria-haspopup="true"
          onMouseEnter={popoverEnter}
          onMouseLeave={popoverLeave}
          ref={popoverAnchor}
        />
      ) : null}

      <Popover
        id={id}
        className={classes.popover}
        classes={{
          paper: classes.popoverContent
        }}
        open={openedPopover}
        anchorEl={popoverAnchor.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        disableRestoreFocus
        PaperProps={{ onMouseEnter: popoverEnter, onMouseLeave: popoverLeave }}
        onClick={event => event.stopPropagation()}
      >
        <Box sx={{ p: 1 }}>
          {externalLookupResults.results &&
            [...Object.keys(externalLookupResults.results)]?.sort().map((sourceName: keyof LookupSourceDetails, i) => (
              <div key={`success_${i}`}>
                <Typography className={clsx(classes.title)} sx={{ display: 'inline' }}>
                  {toTitleCase(sourceName)} :
                </Typography>
                <Link
                  className={clsx(classes.link)}
                  href={externalLookupResults.results[sourceName].link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography
                    className={clsx(classes.content, classes.launch)}
                    sx={{ display: 'inline', marginLeft: '8px' }}
                  >
                    {externalLookupResults.results[sourceName].count} results{' '}
                    <LaunchOutlinedIcon sx={{ verticalAlign: 'middle', height: '16px' }} />
                  </Typography>
                </Link>
              </div>
            ))}
          {externalLookupResults.errors && !!Object.keys(externalLookupResults.errors).length && (
            <>
              <Typography className={clsx(classes.title)}>Errors:</Typography>
              {[...Object.keys(externalLookupResults.errors)].sort().map((sourceName: keyof LookupSourceDetails, i) => (
                <Typography key={`error_${i}`} className={clsx(classes.error)}>
                  {externalLookupResults.errors[sourceName]}
                </Typography>
              ))}
            </>
          )}
        </Box>
      </Popover>
    </div>
  ) : null;
};

const ExternalLinks = React.memo(WrappedExternalLinks);
export default ExternalLinks;
