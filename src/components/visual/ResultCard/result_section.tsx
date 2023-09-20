import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import SimCardOutlinedIcon from '@mui/icons-material/SimCardOutlined';
import { Box, Collapse, IconButton, Menu, MenuItem, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import Attack from 'components/visual/Attack';
import Classification from 'components/visual/Classification';
import Heuristic from 'components/visual/Heuristic';
import SectionHighlight from 'components/visual/SectionHighlight';
import Tag from 'components/visual/Tag';
import Verdict from 'components/visual/Verdict';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GraphBody } from './graph_body';
import { ImageBody } from './image_body';
import { InvalidBody } from './invalid_body';
import { JSONBody } from './json_body';
import { KVBody } from './kv_body';
import { MemDumpBody } from './memdump_body';
import { MultiBody } from './multi_body';
import { OrderedKVBody } from './ordered_kv_body';
import { ProcessTreeBody } from './process_tree_body';
import { TblBody } from './table_body';
import { TextBody } from './text_body';
import { TimelineBody } from './timeline_body';
import { URLBody } from './url_body';

const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const HEURISTIC_ICON = <SimCardOutlinedIcon style={{ marginRight: '16px' }} />;
const TAGS_ICON = <LabelOutlinedIcon style={{ marginRight: '16px' }} />;
const ATTACK_ICON = (
  <span
    style={{
      display: 'inline-flex',
      width: '24px',
      height: '24px',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '16px',
      fontSize: '1.125rem'
    }}
  >
    {'[&]'}
  </span>
);

const useStyles = makeStyles(theme => ({
  section_title: {
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      cursor: 'pointer'
    },
    minHeight: theme.spacing(4.5),
    marginLeft: theme.spacing(-1),
    padding: theme.spacing(0.25, 0, 0.25, 1),
    borderRadius: theme.spacing(0.5)
  },
  printable_section_title: {
    display: 'flex',
    alignItems: 'center'
  },
  muted: {
    color: theme.palette.text.secondary
  }
}));

export type SectionItem = {
  children: SectionItem[];
  id: number;
};

export type Section = {
  auto_collapse: boolean;
  body: any;
  body_format: string;
  body_config?: {
    column_order?: string[];
  };
  classification: string;
  depth: number;
  heuristic: {
    attack: {
      attack_id: string;
      categories: string[];
      pattern: string;
    }[];
    heur_id: string;
    name: string;
    score: number;
    signature: {
      frequency: number;
      name: string;
      safe: boolean;
    }[];
  };
  tags: {
    type: string;
    short_type: string;
    value: string;
    safelisted: boolean;
    classification: string;
  }[];
  title_text: string;
  promote_to: string;
};

type ResultSectionProps = {
  section: Section;
  section_list?: Section[];
  sub_sections?: SectionItem[];
  indent?: number;
  depth?: number;
  nested?: boolean;
  printable?: boolean;
  force?: boolean;
};

const WrappedResultSection: React.FC<ResultSectionProps> = ({
  section,
  section_list = [],
  sub_sections = [],
  indent = 1,
  depth = 1,
  nested = false,
  printable = false,
  force = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(!section.auto_collapse || printable);
  const [render, setRender] = React.useState(!section.auto_collapse || printable);
  const [showTags, setShowTags] = React.useState(false);
  const [showHeur, setShowHeur] = React.useState(false);
  const [showAttack, setShowAttack] = React.useState(false);
  const { getKey, hasHighlightedKeys } = useHighlighter();
  const { c12nDef } = useALContext();
  const [state, setState] = React.useState(null);
  const { copy } = useClipboard();
  const { showSafeResults } = useSafeResults();

  const allTags = useMemo(() => {
    const tagList = [];
    if (!printable) {
      if (Array.isArray(section.tags)) {
        for (const tag of section.tags) {
          tagList.push(getKey(tag.type, tag.value));
        }
      }

      if (section.heuristic !== undefined && section.heuristic !== null) {
        if (section.heuristic.attack !== undefined && section.heuristic.attack.length !== 0) {
          for (const attack of section.heuristic.attack) {
            tagList.push(getKey('attack_pattern', attack.attack_id));
          }
        }
        if (section.heuristic.heur_id !== undefined && section.heuristic.heur_id !== null) {
          tagList.push(getKey('heuristic', section.heuristic.heur_id));
        }
        if (section.heuristic.signature !== undefined && section.heuristic.signature.length !== 0) {
          for (const signature of section.heuristic.signature) {
            tagList.push(getKey('heuristic.signature', signature.name));
          }
        }
      }
    }
    return tagList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const highlighted = hasHighlightedKeys(allTags);

  const handleMenuClick = useCallback(
    event => {
      if (!printable) {
        event.preventDefault();
        setState(
          state === null
            ? {
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4
              }
            : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
              // Other native context menus might behave different.
              // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
              null
        );
      }
    },
    [printable, state]
  );

  const stopPropagation = useCallback(event => {
    event.stopPropagation();
  }, []);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handleClose = useCallback(() => {
    setState(null);
  }, []);

  const handleShowTags = useCallback(() => {
    if (!showTags) setOpen(true);
    setShowTags(!showTags);
    handleClose();
  }, [showTags, handleClose]);

  const handleShowAttack = useCallback(() => {
    if (!showAttack) setOpen(true);
    setShowAttack(!showAttack);
    handleClose();
  }, [showAttack, handleClose]);

  const handleShowHeur = useCallback(() => {
    if (!showHeur) setOpen(true);
    setShowHeur(!showHeur);
    handleClose();
  }, [showHeur, handleClose]);

  const handleMenuCopy = useCallback(() => {
    copy(typeof section.body === 'string' ? section.body : JSON.stringify(section.body, undefined, 2), 'clipID');
    handleClose();
  }, [copy, handleClose, section.body]);

  return section.heuristic && section.heuristic.score < 0 && !showSafeResults && !force ? null : (
    <>
      {!printable && (
        <Menu
          open={state !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={state !== null ? { top: state.mouseY, left: state.mouseX } : undefined}
        >
          <MenuItem id="clipID" dense onClick={handleMenuCopy}>
            {CLIPBOARD_ICON}
            {t('clipboard')}
          </MenuItem>
          {!highlighted && section.heuristic && (
            <MenuItem
              dense
              onClick={handleShowHeur}
              style={{ color: showHeur ? theme.palette.text.primary : theme.palette.text.disabled }}
            >
              {HEURISTIC_ICON}
              {t('show_heur')}
            </MenuItem>
          )}
          {!highlighted && Array.isArray(section.tags) && section.tags.length > 0 && (
            <MenuItem
              dense
              onClick={handleShowTags}
              style={{ color: showTags ? theme.palette.text.primary : theme.palette.text.disabled }}
            >
              {TAGS_ICON}
              {t('show_tags')}
            </MenuItem>
          )}
          {!highlighted &&
            section.heuristic &&
            section.heuristic.attack &&
            Array.isArray(section.heuristic.attack) &&
            section.heuristic.attack.length > 0 && (
              <MenuItem
                dense
                onClick={handleShowAttack}
                style={{ color: showAttack ? theme.palette.text.primary : theme.palette.text.disabled }}
              >
                {ATTACK_ICON}
                {t('show_attack')}
              </MenuItem>
            )}
        </Menu>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          marginLeft: !printable ? `${depth}rem` : null,
          backgroundColor: highlighted ? (theme.palette.mode === 'dark' ? '#343a44' : '#e2f2fa') : null,
          pageBreakInside: 'avoid'
        }}
      >
        {!printable && (
          <SectionHighlight
            score={section.heuristic ? section.heuristic.score : 0}
            indent={indent}
            depth={depth}
            highlighted={highlighted}
            nested={nested}
          />
        )}

        <div style={{ width: `calc(100% - ${!nested ? 8 : 0}px)` }}>
          <Box className={printable ? classes.printable_section_title : classes.section_title} onClick={handleClick}>
            {c12nDef.enforce && !printable && (
              <>
                <Classification c12n={section.classification} type="text" />
                <span>&nbsp;&nbsp;::&nbsp;&nbsp;</span>
              </>
            )}
            {section.heuristic && (
              <>
                <Verdict score={section.heuristic.score} mono short size="tiny" />
                {!printable && <span>&nbsp;::&nbsp;&nbsp;</span>}
              </>
            )}
            <span
              style={{
                fontWeight: 500,
                wordBreak: 'break-word',
                flexGrow: 1,
                paddingLeft: printable ? theme.spacing(1) : null
              }}
            >
              {section.title_text}
            </span>
            {!printable && (
              <>
                <div style={{ color: theme.palette.text.disabled, whiteSpace: 'nowrap' }} onClick={stopPropagation}>
                  {section.heuristic && (
                    <Tooltip title={t('show_heur')} placement="top">
                      <IconButton size="small" onClick={handleShowHeur} color={showHeur ? 'default' : 'inherit'}>
                        <SimCardOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {Array.isArray(section.tags) && section.tags.length > 0 && (
                    <Tooltip title={t('show_tags')} placement="top">
                      <IconButton size="small" onClick={handleShowTags} color={showTags ? 'default' : 'inherit'}>
                        <LabelOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {section.heuristic &&
                    section.heuristic.attack &&
                    Array.isArray(section.heuristic.attack) &&
                    section.heuristic.attack.length > 0 && (
                      <Tooltip title={t('show_attack')} placement="top">
                        <IconButton size="small" onClick={handleShowAttack} color={showAttack ? 'default' : 'inherit'}>
                          {/* <FontDownloadOutlinedIcon /> */}
                          <span
                            style={{
                              display: 'inline-flex',
                              width: '24px',
                              height: '24px',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {'[&]'}
                          </span>
                        </IconButton>
                      </Tooltip>
                    )}
                </div>
                {!printable &&
                  (open ? <ExpandLess className={classes.muted} /> : <ExpandMore className={classes.muted} />)}
              </>
            )}
          </Box>
          <Collapse in={open || printable} timeout="auto" onEnter={() => setRender(true)}>
            {render && (
              <>
                <div style={{ marginLeft: printable ? '2rem' : '1rem', marginBottom: section.body ? '0.75rem' : 0 }}>
                  <div style={{ cursor: 'context-menu' }} onContextMenu={handleMenuClick}>
                    {section.body &&
                      (() => {
                        switch (section.body_format) {
                          case 'TEXT':
                            return <TextBody body={section.body} />;
                          case 'MEMORY_DUMP':
                            return <MemDumpBody body={section.body} />;
                          case 'GRAPH_DATA':
                            return <GraphBody body={section.body} />;
                          case 'URL':
                            return <URLBody body={section.body} />;
                          case 'JSON':
                            return <JSONBody body={section.body} printable={printable} />;
                          case 'KEY_VALUE':
                            return <KVBody body={section.body} />;
                          case 'ORDERED_KEY_VALUE':
                            return <OrderedKVBody body={section.body} />;
                          case 'PROCESS_TREE':
                            return <ProcessTreeBody body={section.body} force={force} />;
                          case 'TABLE':
                            return (
                              <TblBody
                                body={section.body}
                                printable={printable}
                                order={section.body_config ? section.body_config.column_order : []}
                              />
                            );
                          case 'IMAGE':
                            return <ImageBody body={section.body} printable={printable} />;
                          case 'MULTI':
                            return <MultiBody body={section.body} printable={printable} />;
                          case 'TIMELINE':
                            return <TimelineBody body={section.body} />;
                          default:
                            return <InvalidBody />;
                        }
                      })()}
                  </div>

                  {!printable && (
                    <>
                      <Collapse in={showHeur} timeout="auto">
                        {section.heuristic && (
                          <Heuristic
                            text={section.heuristic.name}
                            score={section.heuristic.score}
                            show_type
                            highlight_key={getKey('heuristic', section.heuristic.heur_id)}
                          />
                        )}
                        {section.heuristic &&
                          section.heuristic.signature.map((signature, idx) => (
                            <Heuristic
                              key={idx}
                              text={signature.name}
                              score={section.heuristic.score}
                              signature
                              show_type
                              highlight_key={getKey('heuristic.signature', signature.name)}
                              safe={signature.safe}
                            />
                          ))}
                      </Collapse>
                      <Collapse in={showTags} timeout="auto">
                        {Array.isArray(section.tags) &&
                          section.tags.map((tag, idx) => (
                            <Tag
                              key={idx}
                              type={tag.type}
                              value={tag.value}
                              classification={tag.classification}
                              safelisted={tag.safelisted}
                              short_type={tag.short_type}
                              score={section.heuristic ? section.heuristic.score : 0}
                              highlight_key={getKey(tag.type, tag.value)}
                            />
                          ))}
                      </Collapse>
                      <Collapse in={showAttack} timeout="auto">
                        {section.heuristic &&
                          section.heuristic.attack.map((attack, idx) => (
                            <Attack
                              key={idx}
                              text={attack.pattern}
                              score={section.heuristic.score}
                              show_type
                              highlight_key={getKey('attack_pattern', attack.attack_id)}
                            />
                          ))}
                      </Collapse>
                    </>
                  )}
                </div>
                {!printable && (
                  <div>
                    {sub_sections.map(item => (
                      <ResultSection
                        key={item.id}
                        section={section_list[item.id]}
                        section_list={section_list}
                        sub_sections={item.children}
                        indent={indent + 1}
                        nested
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </Collapse>
        </div>
      </div>
    </>
  );
};

const ResultSection = React.memo(WrappedResultSection);
export default ResultSection;
