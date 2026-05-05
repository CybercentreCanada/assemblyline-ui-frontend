import AssistantIcon from '@mui/icons-material/Assistant';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import {
  Avatar,
  Backdrop,
  Badge,
  Button,
  Divider,
  Fab,
  Fade,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MuiPopper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import AppAvatar from 'commons/components/display/AppAvatar';
import AIMarkdown from 'components/visual/AiMarkdown';
import { ThinkingBadge } from 'components/visual/ThinkingBadge';
import { useAppConfig } from 'core/config';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomChip } from 'ui/CustomChip';
import type { AssistantInsightProps, AssistantMessageProps } from './assistant.models';

//*****************************************************************************************
// Styled Components
//*****************************************************************************************

const Popper = styled(MuiPopper)(() => ({
  zIndex: 1,
  '& > div': { position: 'relative' },
  '&[data-popper-placement*="top"]': {
    '& > div': { marginBottom: 12 }
  }
}));

Popper.displayName = 'Popper';

const Arrow = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: 18,
  '&::before': {
    content: '""',
    margin: 'auto',
    display: 'block',
    width: 12,
    height: 12,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
    boxShadow: '2px 2px 2px 0px rgb(0 0 0 / 25%)',
    borderRadius: '3px 0px'
  }
}));

Arrow.displayName = 'Arrow';

//*****************************************************************************************
// AssistantMessage
//*****************************************************************************************

/** Props for AssistantMessage. */
export type AssistantMessageComponentProps = {
  /** Whether to use compact layout. */
  isXS: boolean;
  /** The message to render. */
  message: AssistantMessageProps;
};

export const AssistantMessage = memo(({ isXS, message }: AssistantMessageComponentProps) => {
  const theme = useTheme();
  const avatar = useAppConfig(s => s?.user?.avatar);
  const email = useAppConfig(s => s?.user?.email);

  const backgroundColor = message.isInsight
    ? theme.palette.mode === 'dark'
      ? '#414f65'
      : '#BADDFB'
    : message.isError
      ? theme.palette.mode === 'dark'
        ? '#4f1717'
        : '#ffe2e2'
      : theme.palette.background.paper;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isXS ? 'column' : message.role === 'assistant' ? 'row' : 'row-reverse',
        padding: theme.spacing(1),
        gap: theme.spacing(1),
        wordBreak: 'break-word'
      }}
    >
      {message.role === 'assistant' ? (
        <Avatar>
          <SmartToyOutlinedIcon />
        </Avatar>
      ) : (
        <AppAvatar url={avatar} email={email} />
      )}
      <Paper sx={{ p: 0, backgroundColor }}>
        <AIMarkdown markdown={message.content} truncated={false} dense />
      </Paper>
    </div>
  );
});

AssistantMessage.displayName = 'AssistantMessage';

//*****************************************************************************************
// AssistantChatDivider
//*****************************************************************************************

export const AssistantChatDivider = memo(() => {
  const { t } = useTranslation(['assistant']);
  const theme = useTheme();

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing(2), marginBottom: theme.spacing(1) }}
    >
      <div
        style={{
          minWidth: '10rem',
          maxWidth: '25rem',
          textAlign: 'center',
          flexGrow: 1,
          color: theme.palette.text.disabled,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Divider style={{ width: '100%' }} />
        <span
          style={{
            marginTop: theme.spacing(-1.25),
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa'
          }}
        >
          &nbsp;&nbsp;&nbsp;{t('new_chat')}&nbsp;&nbsp;&nbsp;
        </span>
      </div>
    </div>
  );
});

AssistantChatDivider.displayName = 'AssistantChatDivider';

//*****************************************************************************************
// AssistantPanel
//*****************************************************************************************

/** Props for AssistantPanel. */
export type AssistantPanelProps = {
  /** Element the popper is anchored to. */
  anchorEl: HTMLElement | null;
  /** Function to send a message. */
  askAssistant: () => void;
  /** Function to ask about a specific insight. */
  askAssistantWithInsight: (insight: AssistantInsightProps) => void;
  /** Ref to the chat scroll container. */
  chatRef: React.RefObject<HTMLDivElement>;
  /** Clear the entire conversation. */
  clearAssistant: () => void;
  /** The message history to display. */
  currentHistory: AssistantMessageProps[];
  /** Current text input value. */
  currentInput: string;
  /** Active insights list. */
  currentInsights: AssistantInsightProps[];
  /** Input change handler. */
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Ref to the text input. */
  inputRef: React.RefObject<HTMLInputElement>;
  /** KeyDown handler for the input. */
  onKeyDown: (event: React.KeyboardEvent) => void;
  /** Whether the panel is open. */
  open: boolean;
  /** Reset assistant to fresh state. */
  resetAssistant: () => void;
  /** Close handler. */
  setOpen: (value: boolean) => void;
  /** Whether the assistant is currently thinking. */
  thinking: boolean;
};

export const AssistantPanel = memo(
  ({
    anchorEl,
    askAssistant,
    askAssistantWithInsight,
    chatRef,
    clearAssistant,
    currentHistory,
    currentInput,
    currentInsights,
    handleInputChange,
    inputRef,
    onKeyDown,
    open,
    resetAssistant,
    setOpen,
    thinking
  }: AssistantPanelProps) => {
    const { t } = useTranslation(['assistant']);
    const theme = useTheme();
    const upSM = useMediaQuery(theme.breakpoints.up('md'));
    const isXS = useMediaQuery(theme.breakpoints.only('xs'));

    const handleClose = useCallback(() => setOpen(false), [setOpen]);

    return (
      <Backdrop open={open} onClick={handleClose}>
        <Popper
          sx={{
            zIndex: 1301,
            width: upSM ? '65%' : '90%',
            maxWidth: '1024px',
            height: upSM ? '75%' : '85%',
            display: 'flex'
          }}
          open={open}
          anchorEl={anchorEl}
          placement="top-end"
          transition
          onClick={event => event.stopPropagation()}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <div style={{ flexGrow: 1, width: '100%' }}>
                <Paper style={{ height: '100%', display: 'flex', overflow: 'hidden' }} elevation={3}>
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', padding: `${theme.spacing(0.25)} ${theme.spacing(1)}` }}>
                      <div style={{ flexGrow: 1, alignSelf: 'center' }}>
                        <Tooltip title={t('caveat')} placement="right">
                          <Typography variant="caption" style={{ color: theme.palette.text.disabled }}>
                            {t('watermark')}
                          </Typography>
                        </Tooltip>
                      </div>
                      <Tooltip title={t('reset')} placement="top">
                        <IconButton onClick={resetAssistant} color="inherit">
                          <RestartAltOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('clear')} placement="top">
                        <IconButton onClick={clearAssistant} color="inherit">
                          <ClearAllIcon />
                        </IconButton>
                      </Tooltip>
                    </div>

                    <div
                      ref={chatRef}
                      style={{
                        backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
                        flexGrow: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.spacing(0.5),
                        marginLeft: theme.spacing(1),
                        marginRight: theme.spacing(1),
                        overflow: 'auto'
                      }}
                    >
                      {currentHistory
                        .filter(message => message.content !== '')
                        .map((message, id) =>
                          message.role === 'system' ? (
                            id !== 0 ? (
                              <AssistantChatDivider key={id} />
                            ) : null
                          ) : (
                            <AssistantMessage key={id} message={message} isXS={isXS} />
                          )
                        )}
                      {thinking && (
                        <div
                          style={{
                            display: 'flex',
                            padding: theme.spacing(1),
                            gap: theme.spacing(1),
                            wordBreak: 'break-word'
                          }}
                        >
                          <Avatar>
                            <SmartToyOutlinedIcon />
                          </Avatar>
                          <Paper sx={{ p: 1, backgroundColor: theme.palette.background.paper }}>
                            <ThinkingBadge />
                          </Paper>
                        </div>
                      )}
                    </div>

                    {currentInsights.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row-reverse',
                          marginTop: theme.spacing(0.75),
                          marginLeft: theme.spacing(1),
                          marginRight: theme.spacing(1),
                          gap: theme.spacing(1)
                        }}
                      >
                        {currentInsights.map((insight, id) => (
                          <CustomChip
                            key={id}
                            variant="outlined"
                            color="primary"
                            label={t(`insight.${insight.type}`)}
                            tooltip={insight.value}
                            tooltipPlacement="top-end"
                            size="small"
                            onClick={() => askAssistantWithInsight(insight)}
                          />
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        margin: `${theme.spacing(0)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)}`
                      }}
                    >
                      <TextField
                        inputRef={inputRef}
                        value={currentInput}
                        onChange={handleInputChange}
                        onKeyDown={onKeyDown}
                        fullWidth
                        size="small"
                        disabled={thinking}
                        margin="dense"
                        InputProps={{
                          endAdornment: (
                            <>
                              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                              <Tooltip title={t('send')} placement="left">
                                <span>
                                  <Button
                                    onClick={askAssistant}
                                    disabled={thinking || currentInput === ''}
                                    size="small"
                                    sx={{
                                      minWidth: 0,
                                      padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
                                      marginRight: theme.spacing(-1)
                                    }}
                                  >
                                    <SendOutlinedIcon />
                                  </Button>
                                </span>
                              </Tooltip>
                            </>
                          )
                        }}
                      />
                    </div>
                  </div>
                </Paper>
                <Arrow className="MuiPopper-arrow" />
              </div>
            </Fade>
          )}
        </Popper>
      </Backdrop>
    );
  }
);

AssistantPanel.displayName = 'AssistantPanel';

//*****************************************************************************************
// AssistantFab
//*****************************************************************************************

/** Props for AssistantFab. */
export type AssistantFabProps = {
  /** Whether there are active insights. */
  hasInsights: boolean;
  /** Click handler. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const AssistantFab = memo(({ hasInsights, onClick }: AssistantFabProps) => {
  const { t } = useTranslation(['assistant']);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        position: 'fixed',
        bottom: theme.spacing(upSM ? 2 : 1.5),
        right: theme.spacing(upSM ? 3 : 1.5),
        zIndex: 1300
      }}
    >
      <Tooltip title={t('title')} placement="left">
        <Fab
          color="primary"
          onClick={onClick}
          size="medium"
          sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#616161' : '#888' }}
        >
          <Badge variant="dot" invisible={!hasInsights} color="primary">
            <AssistantIcon />
          </Badge>
        </Fab>
      </Tooltip>
    </div>
  );
});

AssistantFab.displayName = 'AssistantFab';
