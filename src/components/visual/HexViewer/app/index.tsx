import React from 'react';
import {
  CopyProvider,
  CursorProvider,
  HexApp,
  HexProvider,
  HistoryProvider,
  HoverProvider,
  LayoutProvider,
  LocationProvider,
  ScrollProvider,
  SearchProvider,
  SelectProvider,
  SettingProvider,
  StoreProvider,
  StyleProvider,
  SuggestionProvider
} from '..';

export type DataProps = {
  data: string;
};

export default React.memo(({ data }: DataProps) =>
  data != null && data.length > 0 ? (
    <StoreProvider>
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
                              <SettingProvider>
                                <HexApp data={data} />
                              </SettingProvider>
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
    </StoreProvider>
  ) : null
);
