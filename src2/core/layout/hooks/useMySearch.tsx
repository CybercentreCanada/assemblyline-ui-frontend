import { ContactMail } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import type { AppSearchItem, AppSearchItemRendererOption, AppSearchService, AppSearchServiceState } from '@tui/core';

import { AppAvatar as TuiAvatar } from '@tui/core';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';

export const AppAvatar: FC<{ seed: string }> = ({ seed }) => {
  return null;

  const createAvatar = useMyAvatars();
  return <TuiAvatar url={createAvatar({ text: seed })} />;
};

export type SearchItem = {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  location: {
    street: string;
    city: string;
    state: string;
    postcode: string | number;
  };
};

const SEARCH_ITEMS = [];

export default function useMySearch(): AppSearchService<SearchItem> {
  const navigate = useNavigate();

  // Memoize service implementation in order to prevent unnecessary renders.
  return useMemo(
    () => ({
      // Handler for when the search input receives an 'Enter' key keyboard event.
      onEnter: (value: string, state: AppSearchServiceState<SearchItem>) => {
        state.set({ ...state, searching: true });
        setTimeout(() => {
          const result = SEARCH_ITEMS.filter((p: AppSearchItem<SearchItem>) => p.item.email.indexOf(value) > -1);
          state.set({ ...state, items: result, searching: false });
        }, 1000);
      },

      // Handler for when a search item has focus and receives an 'Enter' key keyboard event.
      onItemSelect: (item: AppSearchItem<SearchItem>, state: AppSearchServiceState) => {
        navigate(`/examples/routing/dynamic/${item.id}`);
        if (state.mode === 'fullscreen') {
          state.set({ ...state, menu: false });
        }
      },

      // Search result item renderer.
      itemRenderer: (item: AppSearchItem<SearchItem>, options: AppSearchItemRendererOption) => {
        const onClick = () => {
          options.state.set({ ...options.state, menu: false });
        };
        return (
          <Link
            to={`/examples/routing/dynamic/${item.id}`}
            style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
            onClick={onClick}
          >
            <Stack direction="row" p={0.5} display="flex">
              <AppAvatar seed={item.item.email} />
              <Stack direction="column" ml={2}>
                <div>
                  {item.item.first_name}&nbsp;{item.item.last_name}{' '}
                </div>
                {options.state.mode === 'fullscreen' && (
                  <>
                    <div>{item.item.email}</div>
                    <Stack direction="row" alignItems="center">
                      <ContactMail />
                      &nbsp;
                      <Typography variant="caption">{item.item.location.city}</Typography>&nbsp;
                      <Typography variant="caption">{item.item.location.state}</Typography>&nbsp;
                      <Typography variant="caption">{item.item.location.postcode}</Typography>
                    </Stack>
                  </>
                )}
              </Stack>
            </Stack>
          </Link>
        );
      }
    }),
    [navigate]
  );
}
