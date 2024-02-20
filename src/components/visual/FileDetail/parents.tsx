import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { AlertTitle, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import InformativeAlert from 'components/visual/InformativeAlert';
import SectionContainer from 'components/visual/SectionContainer';
import 'moment/locale/fr';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  clickable: {
    color: 'inherit',
    display: 'block',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

type ParentSectionProps = {
  parents: any;
  show?: boolean;
  title?: string;
  nocollapse?: boolean;
};

const WrappedParentSection: React.FC<ParentSectionProps> = ({
  parents,
  show = false,
  title = null,
  nocollapse = false
}) => {
  const { t: tDefault } = useTranslation();
  const { t } = useTranslation(['fileDetail', 'archive']);
  const theme = useTheme();
  const classes = useStyles();

  const [showExtra, setShowExtra] = useState<boolean>(false);

  const filteredParents = useMemo(
    () => (!parents || parents.length === 0 || showExtra ? parents : parents.filter((fileItem, i) => i < 10)),
    [parents, showExtra]
  );

  return show || (parents && parents.length !== 0) ? (
    <SectionContainer
      title={title ?? t('parents')}
      nocollapse={nocollapse}
      slots={{
        end: parents && parents?.length > 0 && (
          <Typography
            color="secondary"
            variant="subtitle1"
            children={`${parents?.length} ${t(parents?.length === 1 ? 'file' : 'files', { ns: 'fileDetail' })}`}
            sx={{ fontStyle: 'italic' }}
          />
        )
      }}
    >
      {!parents ? (
        <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
      ) : parents.length === 0 ? (
        <div style={{ width: '100%' }}>
          <InformativeAlert>
            <AlertTitle>{t('no_parents_title', { ns: 'archive' })}</AlertTitle>
            {t('no_parents_desc', { ns: 'archive' })}
          </InformativeAlert>
        </div>
      ) : (
        <>
          {filteredParents?.map((resultKey, i) => {
            const [parentSHA256, service] = resultKey.split('.', 2);
            return (
              <Link
                key={i}
                className={classes.clickable}
                to={`/file/detail/${parentSHA256}`}
                style={{ wordBreak: 'break-word' }}
              >
                <span>{parentSHA256}</span>
                <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{` :: ${service}`}</span>
              </Link>
            );
          })}
          {!showExtra && parents.length > 10 && (
            <Tooltip title={tDefault('more')}>
              <IconButton size="small" onClick={() => setShowExtra(true)} style={{ padding: 0 }}>
                <MoreHorizOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </SectionContainer>
  ) : null;
};

const ParentSection = React.memo(WrappedParentSection);
export default ParentSection;
