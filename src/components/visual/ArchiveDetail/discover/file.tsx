import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Collapse, IconButton, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { FileInfo } from 'components/visual/ArchiveDetail';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiscoverItem from './item';

const OPEN_CLASS = 'open';

const useStyles = makeStyles(theme => {
  const options = {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  };

  return {
    sp2: {
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(2)
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      '&:hover, &:focus': {
        color: theme.palette.text.secondary
      }
    },
    labels: {
      display: 'flex',
      alignItems: 'center'
    },
    item: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: theme.spacing(0.5)
    },
    icon: {
      transform: 'rotate(0deg)',
      transition: theme.transitions.create(['all'], options),
      [`&.${OPEN_CLASS}`]: {
        transform: 'rotate(90deg)'
      }
    },
    name: {},
    type: {
      fontSize: '80%',
      color: theme.palette.text.secondary
    },
    container: {
      display: 'flex',
      flexDirection: 'column'
    },
    button: {
      padding: 0
    },
    collapse: {
      // display: 'contents'
    }
  };
});

type SectionProps = {
  sha256: string;
  depth?: number;
  previous?: string[];
};

const WrappedDiscoverFile: React.FC<SectionProps> = ({ sha256, depth = 0, previous = [] }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();
  const { user: currentUser } = useALContext();

  const [file, setFile] = useState<FileInfo>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const handleReload = useCallback(
    (value: string) => {
      if (!sha256 || !currentUser.roles.includes('file_detail')) return;
      apiCall({
        url: `/api/v4/file/info/${value}/`,
        method: 'GET',
        onSuccess: api_data => setFile(api_data.api_response),
        onFailure: api_data => showErrorMessage(api_data.api_error_message),
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  useEffect(() => {
    handleReload(sha256);
  }, [handleReload, sha256]);

  return (
    file && (
      <>
        <div className={classes.item} style={{ paddingLeft: `calc(${depth} * ${theme.spacing(2)})` }}>
          <Tooltip title={t('tree_more')} placement="left">
            <IconButton className={classes.button} size="small" onClick={() => setOpen(o => !o)}>
              <ArrowRightIcon className={clsx(classes.icon, open && OPEN_CLASS)} />
            </IconButton>
          </Tooltip>
          <span className={classes.name}>{`${file?.sha256}`}</span>
          <span className={classes.type}>{`[${file?.type}]`}</span>
        </div>

        <Collapse className={classes.collapse} in={open} timeout="auto">
          {open && (
            <>
              <DiscoverItem
                title={'type'}
                secondary={file?.type}
                search={`type:"${file?.type}"`}
                depth={depth + 1}
                previous={[...previous, `${file.sha256}`]}
              />
            </>
          )}
          <DiscoverItem
            title={'SSDEEP'}
            secondary={file?.ssdeep?.split(':')[1]}
            search={`ssdeep:${file?.ssdeep?.split(':')[1]}~`}
            depth={depth + 1}
            previous={[...previous, `${file.sha256}`]}
          />
          <DiscoverItem
            title={'SSDEEP'}
            secondary={file?.ssdeep?.split(':')[2]}
            search={`ssdeep:${file?.ssdeep?.split(':')[2]}~`}
            depth={depth + 1}
            previous={[...previous, `${file.sha256}`]}
          />
        </Collapse>
      </>
    )
  );
};

export const DiscoverFile = React.memo(WrappedDiscoverFile);
export default DiscoverFile;
