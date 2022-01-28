/* eslint-disable react-hooks/exhaustive-deps */
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { useEffect, useState } from 'react';

export interface Favorite {
  classification: string;
  name: string;
  query: string;
  created_by: string;
}

interface UsingFavorites {
  onAddUserFavorite: (
    favorite: { query: string; name: string },
    onSuccess?: (favorite: { query: string; name: string }) => void
  ) => void;
  onDeleteUserFavorite: (
    favorite: { query: string; name: string },
    onSuccess?: (favorite: { query: string; name: string }) => void
  ) => void;
  onAddGlobalFavorite: (
    favorite: { query: string; name: string },
    onSuccess?: (favorite: { query: string; name: string }) => void
  ) => void;
  onDeleteGlobalFavorite: (
    favorite: { query: string; name: string },
    onSuccess?: (favorite: { query: string; name: string }) => void
  ) => void;
  userFavorites: Favorite[];
  globalFavorites: Favorite[];
}

export default function useFavorites(): UsingFavorites {
  // hooks.
  const apiCall = useMyAPI();
  const { user } = useALContext();

  // states.
  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);
  const [globalFavorites, setGlobalFavorites] = useState<Favorite[]>([]);

  // Hook API:
  const onAddUserFavorite = (
    favorite: { query: string; name: string },
    onSuccess: (favorite: { query: string; name: string }) => void
  ) => {
    const url = `/api/v4/user/favorites/${user.username}/alert/`;
    apiCall({
      url,
      method: 'put',
      body: favorite,
      onSuccess: api_data => {
        if (api_data.api_response.success) {
          onLoadUserFavorites();
          if (onSuccess) {
            onSuccess(favorite);
          }
        }
      }
    });
  };

  // Hook API:
  const onDeleteUserFavorite = (favorite: Favorite, onSuccess: (favorite: Favorite) => void) => {
    const url = `/api/v4/user/favorites/${user.username}/alert/`;
    apiCall({
      url,
      method: 'delete',
      body: favorite.name,
      onSuccess: api_data => {
        if (api_data.api_response.success) {
          onLoadUserFavorites();
          if (onSuccess) {
            onSuccess(favorite);
          }
        }
      }
    });
  };

  // Hook API:
  const onLoadUserFavorites = () => {
    const url = `/api/v4/user/favorites/${user.username}/`;
    apiCall({
      url,
      onSuccess: api_data => {
        setUserFavorites(api_data.api_response.alert);
      }
    });
  };

  // Hook API:
  const onLoadGlobalFavorites = () => {
    const url = '/api/v4/user/favorites/__global__/';
    apiCall({
      url,
      onSuccess: api_data => {
        setGlobalFavorites(api_data.api_response.alert);
      }
    });
  };

  const onAddGlobalFavorite = (
    favorite: { query: string; name: string },
    onSuccess: (favorite: { query: string; name: string }) => void
  ) => {
    const url = '/api/v4/user/favorites/__global__/alert/';
    const fav = { ...favorite, created_by: user.username };
    apiCall({
      url,
      method: 'put',
      body: fav,
      onSuccess: api_data => {
        if (api_data.api_response.success) {
          onLoadGlobalFavorites();
          if (onSuccess) {
            onSuccess(fav);
          }
        }
      }
    });
  };

  // Hook API:
  const onDeleteGlobalFavorite = (favorite: Favorite, onSuccess: (favorite: Favorite) => void) => {
    const url = '/api/v4/user/favorites/__global__/alert/';
    apiCall({
      url,
      method: 'delete',
      body: favorite.name,
      onSuccess: api_data => {
        if (api_data.api_response.success) {
          onLoadGlobalFavorites();
          if (onSuccess) {
            onSuccess(favorite);
          }
        }
      }
    });
  };

  // Load favorites.
  useEffect(() => {
    onLoadUserFavorites();
    onLoadGlobalFavorites();
  }, []);

  // The Custom Hook API:
  return {
    userFavorites,
    globalFavorites,
    onAddUserFavorite,
    onAddGlobalFavorite,
    onDeleteUserFavorite,
    onDeleteGlobalFavorite
  };
}
