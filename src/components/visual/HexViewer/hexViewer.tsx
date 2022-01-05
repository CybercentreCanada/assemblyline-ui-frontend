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
  StoreProvider,
  StyleProvider,
  SuggestionProvider
} from '.';

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
                              <HexApp data={data} />
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

/**
 * To Do:
 *
 * change the hexViewwer to main.tsx and remove store
 *
 * 1. done - Clean the useSearch
 * 2. Add the translation
 * 3. Finish the settings menu to include
 *  3.1 changing the base value
 *  3.2 width of the viewer: auto, 8, 16,
 * 4. Add a jump to function in the settings
 * 5. Better the search value
 * 6. useQuery to save the history of search
 *
 */
