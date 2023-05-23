import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Link, Popover, SvgIconTypeMap, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
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
    color: theme.palette.text.primary,
    fontSize: 'medium'
  },
  content: {
    flex: 1,
    fontWeight: 400,
    color: theme.palette.primary.main,
    fontSize: 'medium'
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
  results: {
    [sourceName: string]: {
      link: string;
      count: number;
    };
  };
  errors: {
    [sourceName: string]: string;
  };
  success: null | boolean;
  iconStyle?: null | Object;
};

// This needs to be taken out into it's own `forwardRef` to enable ref to be passed onto the Icon for tooltips to work
const EXTERNAL_RESULTS_ICON = forwardRef<SvgIconTypeMap | null, any>((props, ref) => {
  const { success, iconHeight, ...remainingProps } = props;
  return (
    <>
      {success === true && <LinkOutlinedIcon ref={ref} {...remainingProps} />}
      {success === false && <ErrorOutlineOutlinedIcon ref={ref} {...remainingProps} />}
    </>
  );
});

const WrappedExternalLinks: React.FC<ExternalLookupProps> = ({ results, errors, success, iconStyle }) => {
  const classes = useStyles();
  const [openedPopover, setOpenedPopover] = React.useState(false);
  const popoverAnchor = React.useRef(null);

  const popoverEnter = ({ currentTarget }) => {
    setOpenedPopover(true);
  };

  const popoverLeave = ({ currentTarget }) => {
    setOpenedPopover(false);
  };

  const id = openedPopover ? 'external-result-popover' : undefined;

  return (
    <div>
      {success !== null ? (
        <EXTERNAL_RESULTS_ICON
          success={success}
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
      >
        <Typography sx={{ p: 1 }}>
          {Object.keys(results)?.map((sourceName: keyof LookupSourceDetails, i) => (
            <React.Fragment key={`success_${i}`}>
              <Typography className={clsx(classes.title)} sx={{ display: 'inline' }}>
                {sourceName}:
              </Typography>
              <Link
                className={clsx(classes.link)}
                href={results[sourceName].link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Typography
                  className={clsx(classes.content, classes.launch)}
                  sx={{ display: 'inline', marginLeft: '8px' }}
                >
                  {results[sourceName].count} results{' '}
                  <LaunchOutlinedIcon sx={{ verticalAlign: 'middle', height: '16px' }} />
                </Typography>
              </Link>
            </React.Fragment>
          ))}
          {!!Object.keys(errors).length && (
            <>
              <Typography className={clsx(classes.title)}>Errors:</Typography>
              {Object.keys(errors).map((sourceName: keyof LookupSourceDetails, i) => (
                <Typography key={`error_${i}`} className={clsx(classes.error)}>
                  {errors[sourceName]}
                </Typography>
              ))}
            </>
          )}
        </Typography>
      </Popover>
    </div>
  );
};

const ExternalLinks = React.memo(WrappedExternalLinks);
export default ExternalLinks;
