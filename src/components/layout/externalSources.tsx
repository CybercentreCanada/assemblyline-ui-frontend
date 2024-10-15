import { Checkbox, FormControlLabel, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import { UserSettings } from 'components/models/base/user_settings';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme =>
  createStyles({
    item: {
      width: '100%',
      '&:hover': {
        background: theme.palette.action.hover
      }
    }
  })
);

type ExternalSourcesProps = {
  settings: UserSettings;
  onChange: (name: string) => void;
  disabled?: boolean;
  size?: 'medium' | 'small';
};

function ExternalSources({ settings, onChange, disabled = false, size = 'medium' as 'medium' }: ExternalSourcesProps) {
  const { t } = useTranslation(['settings']);
  const classes = useStyles();
  const theme = useTheme();
  const { configuration } = useALContext();

  const fileSources = useMemo<string[]>(
    () =>
      Object.values(configuration?.submission?.file_sources || {})
        .flatMap(file => file?.sources)
        .filter((value, index, array) => value && array.indexOf(value) === index),
    [configuration]
  );

  return (
    <div style={{ padding: theme.spacing(2), textAlign: 'left' }}>
      <Typography variant="h6">{t('submissions.default_external_sources')}</Typography>
      <Typography variant="caption" gutterBottom>
        {t('submissions.default_external_sources_desc')}
      </Typography>
      {fileSources.sort().map((source, i) => (
        <div key={i}>
          <FormControlLabel
            control={
              settings ? (
                <Checkbox
                  size={size}
                  disabled={disabled}
                  checked={settings.default_external_sources.indexOf(source) !== -1}
                  name="label"
                  onChange={() => onChange(source)}
                />
              ) : (
                <Skeleton
                  style={{
                    height: size === 'medium' ? '2.5rem' : '2rem',
                    width: '1.5rem',
                    marginLeft: theme.spacing(2),
                    marginRight: theme.spacing(2)
                  }}
                />
              )
            }
            label={<Typography variant="body2">{source}</Typography>}
            className={settings && !disabled ? classes.item : null}
          />
        </div>
      ))}
    </div>
  );
}

export default ExternalSources;
