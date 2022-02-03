import React, { useMemo } from 'react';
import {
  CopyProvider,
  CursorProvider,
  HexProvider,
  HistoryProvider,
  HoverProvider,
  LayoutProvider,
  LocationProvider,
  ModeProvider,
  ScrollProvider,
  SearchProvider,
  SelectProvider,
  SettingProvider,
  StyleProvider,
  SuggestionProvider
} from '..';

export type AppHookInitProps = {
  children?: React.ReactNode;
};

const WrappedAppHookInit = ({ children = null }: AppHookInitProps) => (
  <ModeProvider>
    <HexProvider>
      <LayoutProvider>
        <StyleProvider>
          <HoverProvider>
            <ScrollProvider>
              <CursorProvider>
                <SelectProvider>
                  <SearchProvider>
                    <SuggestionProvider>
                      <HistoryProvider>
                        <CopyProvider>
                          <LocationProvider>
                            <SettingProvider>{useMemo(() => children, [children])}</SettingProvider>
                          </LocationProvider>
                        </CopyProvider>
                      </HistoryProvider>
                    </SuggestionProvider>
                  </SearchProvider>
                </SelectProvider>
              </CursorProvider>
            </ScrollProvider>
          </HoverProvider>
        </StyleProvider>
      </LayoutProvider>
    </HexProvider>
  </ModeProvider>
);

export const AppHookInit = React.memo(WrappedAppHookInit);
export default AppHookInit;
