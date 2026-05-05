import type { PropsWithChildren } from 'react';
import { createContext, memo, useCallback, useContext } from 'react';
import { AssistantFab, AssistantPanel } from './assistant.components';
import { useAppAssistantState } from './assistant.hooks';
import type { AppAssistantContextProps } from './assistant.models';
import { DEFAULT_APP_ASSISTANT_CONTEXT } from './assistant.models';

//*****************************************************************************************
// AppAssistantContext
//*****************************************************************************************

export const AppAssistantContext = createContext<AppAssistantContextProps>(DEFAULT_APP_ASSISTANT_CONTEXT);

/**
 * @name useAppAssistant
 * @description Provides access to the assistant context for managing insights and toggling the panel.
 * @returns AppAssistantContextProps
 */
export const useAppAssistant = (): AppAssistantContextProps => useContext(AppAssistantContext);

//*****************************************************************************************
// AppAssistantProvider
//*****************************************************************************************

export const AppAssistantProvider = memo(({ children }: PropsWithChildren) => {
  const state = useAppAssistantState();

  const contextValue: AppAssistantContextProps = {
    addInsight: state.addInsight,
    assistantAllowed: state.assistantAllowed,
    hasInsights: state.hasInsights,
    removeInsight: state.removeInsight,
    toggleAssistant: state.toggleAssistant
  };

  const handleFabClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      state.toggleAssistant(event.currentTarget);
    },
    [state]
  );

  return (
    <AppAssistantContext.Provider value={contextValue}>
      {children}
      {state.assistantAllowed ? (
        <>
          <AssistantPanel
            anchorEl={state.anchorEl}
            askAssistant={state.askAssistant}
            askAssistantWithInsight={state.askAssistantWithInsight}
            chatRef={state.chatRef}
            clearAssistant={state.clearAssistant}
            currentHistory={state.currentHistory}
            currentInput={state.currentInput}
            currentInsights={state.currentInsights}
            handleInputChange={state.handleInputChange}
            inputRef={state.inputRef}
            onKeyDown={state.onKeyDown}
            open={state.open}
            resetAssistant={state.resetAssistant}
            setOpen={state.setOpen}
            thinking={state.thinking}
          />
          <AssistantFab hasInsights={state.hasInsights} onClick={handleFabClick} />
        </>
      ) : null}
    </AppAssistantContext.Provider>
  );
});

AppAssistantProvider.displayName = 'AppAssistantProvider';
