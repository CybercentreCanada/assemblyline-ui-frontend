import { Collapse, Divider, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ErrorCard from '../ErrorCard';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type ErrorSectionProps = {
  errors: any;
};

const WrappedErrorSection: React.FC<ErrorSectionProps> = ({ errors }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return errors && errors.length !== 0 ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('errors')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {errors.map((error, i) => (
            <ErrorCard key={i} error={error} />
          ))}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const ErrorSection = React.memo(WrappedErrorSection);
export default ErrorSection;
