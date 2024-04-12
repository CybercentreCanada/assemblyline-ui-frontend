import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SelectAllOutlinedIcon from '@mui/icons-material/SelectAllOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Divider, Link as MaterialLink, ListSubheader, Menu, MenuItem, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useExternalLookup from 'components/hooks/useExternalLookup';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { isAccessible } from 'helpers/classificationParser';
import { safeFieldValueURI, toTitleCase } from 'helpers/utils';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import ClassificationMismatchDialog from './ClassificationMismatchDialog';
import InputDialog from './InputDialog';
import SafeBadItem from './SafeBadItem';

const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const HIGHLIGHT_ICON = <SelectAllOutlinedIcon style={{ marginRight: '16px' }} />;
const BADLIST_ICON = <BugReportOutlinedIcon style={{ marginRight: '16px' }} />;
const SAFELIST_ICON = <VerifiedUserOutlinedIcon style={{ marginRight: '16px' }} />;
const SUBMIT_ICON = <PublishOutlinedIcon style={{ marginRight: '16px' }} />;
const TRAVEL_EXPLORE_ICON = <TravelExploreOutlinedIcon style={{ marginRight: '16px' }} />;
const SIGNATURE_ICON = <FingerprintOutlinedIcon style={{ marginRight: '16px' }} />;

const EXTERNAL_ICON = <HiOutlineExternalLink style={{ marginRight: '16px', fontSize: '22px' }} />;
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

type Coordinates = {
  mouseX: number | null;
  mouseY: number | null;
};

type TagProps = {
  category: 'heuristic' | 'signature' | 'hash' | 'metadata' | 'tag';
  type: string;
  value: string;
  classification?: string | null;
  state: Coordinates;
  setState: (Coordinates) => void;
  highlight_key?: string;
};

const categoryPrefix = {
  heuristic: 'result.sections.heuristic.name',
  signature: 'result.sections.heuristic.signature.name',
  metadata: 'metadata.',
  tag: 'result.sections.tags.',
  hash: ''
};

const categoryIndex = {
  heuristic: '/result',
  signature: '/result',
  metadata: '',
  tag: '/result',
  hash: ''
};

const WrappedActionMenu: React.FC<TagProps> = ({
  category,
  type,
  value,
  classification = null,
  state,
  setState,
  highlight_key = null
}) => {
  const { t } = useTranslation();
  const { user: currentUser, configuration: currentUserConfig, c12nDef } = useALContext();
  const { copy } = useClipboard();
  const classes = useStyles();
  const [confirmationDialog, setConfirmationDialog] = React.useState(false);
  const [currentEvent, setCurrentEvent] = React.useState<Event>(null);
  const [currentAllowBypass, setCurrentAllowBypass] = React.useState(false);
  const [currentLinkClassification, setCurrentLinkClassification] = React.useState('');
  const [safelistDialog, setSafelistDialog] = React.useState(false);
  const [safelistReason, setSafelistReason] = React.useState(null);
  const [badlistDialog, setBadlistDialog] = React.useState(false);
  const [badlistReason, setBadlistReason] = React.useState(null);
  const [waitingDialog, setWaitingDialog] = React.useState(false);
  const [badlisted, setBadlisted] = React.useState(null);
  const [safelisted, setSafelisted] = React.useState(null);
  const { showSuccessMessage } = useMySnackbar();
  const { triggerHighlight } = useHighlighter();
  const { apiCall } = useMyAPI();

  const { enrichTagExternal, enrichmentState, getKey } = useExternalLookup();
  const externalLookupResults = enrichmentState[getKey(type, value)];
  const [allInProgress, setAllInProgress] = React.useState(false);

  useEffect(() => {
    if (state.mouseY !== null) {
      if (currentUser.roles.includes('safelist_manage')) {
        if (category === 'tag') {
          apiCall({
            url: `/api/v4/safelist/${type}/${encodeURIComponent(encodeURIComponent(value))}/`,
            method: 'GET',
            onSuccess: resp => {
              setSafelisted(resp.api_response);
            },
            onFailure: () => setSafelisted(null)
          });
        }
        if (category === 'signature') {
          apiCall({
            url: `/api/v4/safelist/signature/${encodeURIComponent(encodeURIComponent(value))}/`,
            method: 'GET',
            onSuccess: resp => {
              setSafelisted(resp.api_response);
            },
            onFailure: () => setSafelisted(null)
          });
        }
      }
      if (category === 'tag' && currentUser.roles.includes('badlist_manage')) {
        apiCall({
          url: `/api/v4/badlist/${type}/${encodeURIComponent(encodeURIComponent(value))}/`,
          method: 'GET',
          onSuccess: resp => {
            setBadlisted(resp.api_response);
          },
          onFailure: () => setBadlisted(null)
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleClose = useCallback(() => {
    setState(initialMenuState);
  }, [setState]);

  const proceedExternalLink = useCallback(() => {
    const target = currentEvent.target as HTMLElement;
    target.click();
    setConfirmationDialog(false);
  }, [currentEvent]);

  const checkClassification = useCallback(
    (event, link_classification, allow_bypass) => {
      if (!isAccessible(link_classification, classification, c12nDef, c12nDef.enforce)) {
        event.preventDefault();
        setCurrentEvent(event);
        setCurrentAllowBypass(allow_bypass);
        setCurrentLinkClassification(link_classification);
        setConfirmationDialog(true);
      }
      handleClose();
    },
    [c12nDef, classification, handleClose]
  );

  const handleMenuCopy = useCallback(() => {
    copy(value, 'clipID');
    handleClose();
  }, [copy, handleClose, value]);

  const handleMenuExternalSearch = useCallback(
    source => {
      enrichTagExternal(source, type, value, classification);
      handleClose();
    },
    [enrichTagExternal, handleClose, type, value, classification]
  );

  const handleHighLight = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const handleMenuHighlight = useCallback(() => {
    handleHighLight();
    handleClose();
  }, [handleHighLight, handleClose]);

  const handleMenuSafelist = useCallback(() => {
    setSafelistDialog(true);
    handleClose();
  }, [setSafelistDialog, handleClose]);

  const addToSafelist = useCallback(() => {
    let data = null;
    if (category === 'signature') {
      data = {
        signature: {
          name: value
        },
        sources: [
          {
            name: currentUser.username,
            reason: [safelistReason],
            type: 'user'
          }
        ],
        type: 'signature'
      };
    } else {
      data = {
        tag: {
          type,
          value
        },
        sources: [
          {
            classification: classification,
            name: currentUser.username,
            reason: [safelistReason],
            type: 'user'
          }
        ],
        type: 'tag'
      };
    }

    apiCall({
      url: `/api/v4/safelist/`,
      method: 'PUT',
      body: data,
      onSuccess: _ => {
        setSafelistDialog(false);
        showSuccessMessage(t('safelist.success'));
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safelistReason, t, type, value]);

  const handleMenuBadlist = useCallback(() => {
    setBadlistDialog(true);
    handleClose();
  }, [setBadlistDialog, handleClose]);

  const addToBadlist = useCallback(() => {
    const data = {
      tag: {
        type,
        value
      },
      sources: [
        {
          classification: classification,
          name: currentUser.username,
          reason: [badlistReason],
          type: 'user'
        }
      ],
      type: 'tag'
    };

    apiCall({
      url: `/api/v4/badlist/`,
      method: 'PUT',
      body: data,
      onSuccess: _ => {
        setBadlistDialog(false);
        showSuccessMessage(t('badlist.success'));
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badlistReason, t, type, value]);

  const hasExternalQuery =
    !!currentUser.roles.includes('external_query') &&
    !!currentUserConfig.ui.external_sources?.length &&
    !!currentUserConfig.ui.external_source_tags?.hasOwnProperty(type);

  const hasExternalLinks =
    !!currentUserConfig.ui.external_links?.hasOwnProperty(category) &&
    !!currentUserConfig.ui.external_links[category].hasOwnProperty(type);

  useEffect(() => {
    if (!!externalLookupResults) {
      let inProgress = true;
      Object.values(externalLookupResults).forEach(results => {
        if (!results.inProgress) {
          inProgress = false;
        }
      });
      setAllInProgress(inProgress);
    }
  }, [externalLookupResults]);

  return hasExternalLinks ||
    hasExternalQuery ||
    category === 'heuristic' ||
    category === 'signature' ||
    category === 'tag' ? (
    <>
      <ClassificationMismatchDialog
        open={confirmationDialog}
        handleClose={() => setConfirmationDialog(false)}
        handleAccept={currentAllowBypass ? proceedExternalLink : null}
        dataClassification={classification}
        targetClassification={currentLinkClassification}
      />
      {(category === 'tag' || category === 'signature') && (
        <InputDialog
          open={safelistDialog}
          handleClose={() => setSafelistDialog(false)}
          handleAccept={addToSafelist}
          handleInputChange={event => setSafelistReason(event.target.value)}
          inputValue={safelistReason}
          title={t('safelist.title')}
          cancelText={t('safelist.cancelText')}
          acceptText={t('safelist.acceptText')}
          inputLabel={t('safelist.input')}
          text={t('safelist.text')}
          waiting={waitingDialog}
        />
      )}
      {category === 'tag' && (
        <InputDialog
          open={badlistDialog}
          handleClose={() => setBadlistDialog(false)}
          handleAccept={addToBadlist}
          handleInputChange={event => setBadlistReason(event.target.value)}
          inputValue={badlistReason}
          title={t('badlist.title')}
          cancelText={t('badlist.cancelText')}
          acceptText={t('badlist.acceptText')}
          inputLabel={t('badlist.input')}
          text={t('badlist.text')}
          waiting={waitingDialog}
        />
      )}
      <Menu
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
        }
      >
        {category === 'tag' && type.startsWith('file.rule.') && currentUser.roles.includes('signature_view') && (
          <MenuItem
            id="clipID"
            dense
            component={Link}
            to={`/manage/signature/${type.substring(10)}/${value.substring(0, value.indexOf('.'))}/${value.substring(
              value.indexOf('.') + 1
            )}`}
          >
            {SIGNATURE_ICON}
            {t('goto_signature')}
          </MenuItem>
        )}
        <MenuItem id="clipID" dense onClick={handleMenuCopy}>
          {CLIPBOARD_ICON}
          {t('clipboard')}
        </MenuItem>
        {currentUser.roles.includes('submission_view') && (
          <MenuItem
            dense
            component={Link}
            to={`/search${categoryIndex[category]}?query=${categoryPrefix[category]}${type}:${safeFieldValueURI(
              value
            )}`}
            onClick={handleClose}
          >
            {SEARCH_ICON}
            {t('related')}
          </MenuItem>
        )}
        {highlight_key && (
          <MenuItem dense onClick={handleMenuHighlight}>
            {HIGHLIGHT_ICON}
            {t('highlight')}
          </MenuItem>
        )}
        {category === 'tag' && currentUser.roles.includes('badlist_manage') && (
          <Tooltip title={badlisted ? <SafeBadItem item={badlisted} /> : ''} placement="right" arrow>
            <div>
              <MenuItem dense onClick={handleMenuBadlist} disabled={badlisted !== null}>
                {BADLIST_ICON}
                {t(`${badlisted !== null ? 'already_' : ''}badlist`)}
              </MenuItem>
            </div>
          </Tooltip>
        )}
        {(category === 'tag' || category === 'signature') && currentUser.roles.includes('safelist_manage') && (
          <Tooltip title={safelisted ? <SafeBadItem item={safelisted} /> : ''} placement="right" arrow>
            <div>
              <MenuItem dense onClick={handleMenuSafelist} disabled={safelisted !== null}>
                {SAFELIST_ICON}
                {t(`${safelisted !== null ? 'already_' : ''}safelist`)}
              </MenuItem>
            </div>
          </Tooltip>
        )}
        {category === 'tag' && type.endsWith('.uri') && !!currentUserConfig?.ui?.allow_url_submissions && (
          <MenuItem
            dense
            component={Link}
            to="/submit"
            state={{
              hash: value,
              tabContext: '1',
              c12n: classification
            }}
          >
            {SUBMIT_ICON}
            {t('submit_uri')}
          </MenuItem>
        )}
        {hasExternalQuery && (
          <div>
            <Divider />
            <ListSubheader disableSticky classes={{ root: classes.listSubHeaderRoot }}>
              {t('related_external')}
            </ListSubheader>
            <MenuItem dense onClick={() => handleMenuExternalSearch(null)} disabled={allInProgress}>
              {TRAVEL_EXPLORE_ICON} {t('related_external.all')}
            </MenuItem>

            {currentUserConfig.ui.external_source_tags?.[type]?.sort().map((source, i) => (
              <MenuItem
                dense
                key={`source_${i}`}
                onClick={() => handleMenuExternalSearch(source)}
                disabled={!!externalLookupResults?.[source]?.inProgress}
              >
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
              <MenuItem
                dense
                component={MaterialLink}
                key={`source_${i}`}
                rel="noopener noreferrer"
                target="_blank"
                href={link.url.replace(
                  link.replace_pattern,
                  encodeURIComponent(link.double_encode ? encodeURIComponent(value) : value)
                )}
                onClick={event => checkClassification(event, link.max_classification, link.allow_bypass)}
              >
                {EXTERNAL_ICON} {link.name}
              </MenuItem>
            ))}
          </div>
        )}
      </Menu>
    </>
  ) : null;
};

const ActionMenu = React.memo(WrappedActionMenu);
export default ActionMenu;
