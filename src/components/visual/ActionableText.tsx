import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { Divider, Link as MaterialLink, ListSubheader, Menu, MenuItem, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import { safeFieldValueURI } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { useNavigate } from 'react-router';
import ExternalLinks from './ExternalLookup/ExternalLinks';
import { useSearchTagExternal } from './ExternalLookup/useExternalLookup';

const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const TRAVEL_EXPLORE_ICON = <TravelExploreOutlinedIcon style={{ marginRight: '16px' }} />;
const EXTERNAL_ICON = (
  <HiOutlineExternalLink style={{ marginRight: '16px', fontSize: '22px', verticalAlign: 'middle' }} />
);
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

const useStyles = makeStyles(theme => ({
  listSubHeaderRoot: {
    lineHeight: '32px'
  },
  link: {
    marginLeft: theme.spacing(-0.5),
    paddingLeft: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

type TagProps = {
  category: 'metadata' | 'hash';
  type: string;
  value: string;
  classification?: string | null;
};

const WrappedActionableText: React.FC<TagProps> = ({ category, type, value, classification }) => {
  const { t } = useTranslation();
  const [state, setState] = React.useState(initialMenuState);
  const navigate = useNavigate();
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const { copy } = useClipboard();
  const classes = useStyles();

  const handleMenuClick = useCallback(event => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  const searchItem = useCallback(
    () => navigate(`/search?query=${category === 'metadata' ? `metadata.` : ''}${type}:${safeFieldValueURI(value)}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, type, value]
  );

  const { lookupState, searchTagExternal, toTitleCase } = useSearchTagExternal({
    [type]: {
      results: {},
      errors: {},
      success: null
    }
  });

  const handleClose = useCallback(() => {
    setState(initialMenuState);
  }, []);

  const handleMenuCopy = useCallback(() => {
    copy(value, 'clipID');
    handleClose();
  }, [copy, handleClose, value]);

  const handleMenuSearch = useCallback(() => {
    searchItem();
    handleClose();
  }, [searchItem, handleClose]);

  const handleMenuExternalSearch = useCallback(
    source => {
      searchTagExternal(source, type, value, classification);
      handleClose();
    },
    [searchTagExternal, handleClose, type, value, classification]
  );

  const hasExternalQuery =
    !!currentUser.roles.includes('external_query') &&
    !!currentUserConfig.ui.external_sources?.length &&
    !!currentUserConfig.ui.external_source_tags?.hasOwnProperty(type);

  const hasExternalLinks =
    !!currentUserConfig.ui.external_links?.hasOwnProperty(category) &&
    !!currentUserConfig.ui.external_links[category].hasOwnProperty(type);

  return (
    <>
      {value ? (
        hasExternalLinks || hasExternalQuery ? (
          <>
            <Menu
              open={state.mouseY !== null}
              onClose={handleClose}
              anchorReference="anchorPosition"
              anchorPosition={
                state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
              }
            >
              <MenuItem id="clipID" dense onClick={handleMenuCopy}>
                {CLIPBOARD_ICON}
                {t('clipboard')}
              </MenuItem>
              {currentUser.roles.includes('submission_view') && (
                <MenuItem dense onClick={handleMenuSearch}>
                  {SEARCH_ICON}
                  {t('related')}
                </MenuItem>
              )}
              {hasExternalQuery && (
                <div>
                  <Divider />
                  <ListSubheader disableSticky classes={{ root: classes.listSubHeaderRoot }}>
                    {t('related_external')}
                  </ListSubheader>

                  <MenuItem dense onClick={() => handleMenuExternalSearch(null)}>
                    {TRAVEL_EXPLORE_ICON} {t('related_external.all')}
                  </MenuItem>

                  {currentUserConfig.ui.external_source_tags?.[type]?.sort().map((source, i) => (
                    <MenuItem dense key={`source_${i}`} onClick={() => handleMenuExternalSearch(source)}>
                      {TRAVEL_EXPLORE_ICON} {toTitleCase(source)}
                    </MenuItem>
                  ))}
                </div>
              )}
              {hasExternalLinks && (
                <div>
                  <Divider />
                  <ListSubheader disableSticky classes={{ root: classes.listSubHeaderRoot }}>
                    {t('external_link')}
                  </ListSubheader>

                  {currentUserConfig.ui.external_links[category][type].map((link, i) => (
                    <MenuItem dense key={`source_${i}`}>
                      <MaterialLink
                        onClick={handleClose}
                        target="_blank"
                        underline="none"
                        rel="noopener noreferrer"
                        color="inherit"
                        href={link.url.replace(
                          link.replace_pattern,
                          encodeURIComponent(link.double_encode ? encodeURIComponent(value) : value)
                        )}
                      >
                        {EXTERNAL_ICON} {link.name}
                      </MaterialLink>
                    </MenuItem>
                  ))}
                </div>
              )}
            </Menu>
            <MaterialLink className={classes.link} onClick={handleMenuClick} onContextMenu={handleMenuClick}>
              {value}
              {lookupState && lookupState[type] ? (
                <ExternalLinks
                  success={lookupState[type].success}
                  results={lookupState[type].results}
                  errors={lookupState[type].errors}
                  iconStyle={{ marginRight: '-3px', marginLeft: '3px', height: '20px', verticalAlign: 'text-bottom' }}
                />
              ) : null}
            </MaterialLink>
          </>
        ) : (
          value
        )
      ) : (
        <Skeleton />
      )}
    </>
  );
};

const ActionableText = React.memo(WrappedActionableText);
export default ActionableText;
