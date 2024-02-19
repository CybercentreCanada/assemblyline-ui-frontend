import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { Feed, FeedItem, FeedSchema, FeedURLs, FeedURLsSchema } from 'components/models/notification';
import { Service, ServicesSchema } from 'components/models/service';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
  lastTimeOpen: Date;
};

export const useNotificationFeed = ({ lastTimeOpen = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }: Props) => {
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration } = useALContext();

  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const urls = useMemo<FeedURLs>(
    () => configuration && FeedURLsSchema.parse(configuration?.ui?.rss_feeds),
    [configuration]
  );
  const isAdmin = useMemo<boolean>(() => currentUser && currentUser?.is_admin, [currentUser]);
  const systemVersion = useMemo<string>(() => configuration && configuration?.system?.version, [configuration]);
  const systemType = useMemo<'dev' | 'prod' | null>(
    () =>
      !systemVersion
        ? null
        : /(\d){1,}\.(\d){1,}\.(\d){1,}\.(d|D)ev(\d){1,}/g.test(systemVersion)
        ? 'dev'
        : /(\d){1,}\.(\d){1,}\.(\d){1,}\.(\d){1,}/g.test(systemVersion)
        ? 'prod'
        : null,
    [systemVersion]
  );

  const fetchFeed = useCallback(
    (url: string) =>
      new Promise<Feed>(async (resolve, reject) => {
        try {
          const response = await fetch(url, { method: 'GET' });
          const text = await response.text();
          const json = await JSON.parse(text);
          const feed = await FeedSchema.parse(json);
          resolve(feed);
        } catch (err) {
          reject(err);
        }
      }),
    []
  );

  const fetchAllFeeds = useCallback(
    (feedURLs: string[] = []) =>
      new Promise<Feed[]>(async (resolve, reject) => {
        try {
          const parsedURLs = await FeedURLsSchema.parse(feedURLs);
          const f = await Promise.all(parsedURLs.map(url => fetchFeed(url)));
          resolve(f);
        } catch (err) {
          reject(err);
        }
      }),
    [fetchFeed]
  );

  const areArraysEquals = useCallback(
    (a: any, b: any): boolean =>
      Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]),
    []
  );

  const areArrayHigher = useCallback((a: any, b: any): boolean => {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    let i = 0;
    while (i < a.length) {
      if (a[i] > b[i]) return true;
      else if (a[i] < b[i]) return false;
      else i++;
    }
    return false;
  }, []);

  const getVersionValues = useCallback(
    (value: string): Array<number> =>
      value
        ?.match(/(\d){1,}\.(\d){1,}\.(\d){1,}\..*/g)
        ?.at(0)
        ?.replaceAll(/[^0-9.]/g, '')
        ?.split('.')
        ?.map(v => parseInt(v)),
    []
  );

  const isNewSystemVersion = useCallback(
    (item: FeedItem): null | 'newer' | 'current' | 'older' => {
      const notVer = item.url;
      if (!((/(d|D)ev/g.test(notVer) && systemType === 'dev') || (/(s|S)table/g.test(notVer) && systemType === 'prod')))
        return null;

      const notValues: Array<number> = getVersionValues(notVer);
      const sysValues: Array<number> = getVersionValues(systemVersion);

      if (areArraysEquals(notValues, sysValues)) return 'current';
      else if (areArrayHigher(notValues, sysValues)) return 'newer';
      else return 'older';
    },
    [areArrayHigher, areArraysEquals, getVersionValues, systemType, systemVersion]
  );

  const isNewService = useCallback(
    (item: FeedItem): null | boolean => {
      if (!/(s|S)ervice/g.test(item.title)) return null;
      const title = item?.title?.toLowerCase().slice(0, -16);
      return services.some(s => title === s?.name?.toLowerCase());
    },
    [services]
  );

  useEffect(() => {
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: ({ api_response }) => setServices(ServicesSchema.parse(api_response))
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAllFeeds(urls)
      .then(data => setFeeds(data))
      // eslint-disable-next-line no-console
      .catch(e => console.error(e));
    return () => setFeeds([]);
  }, [fetchAllFeeds, urls]);

  const notifications = useMemo<FeedItem[]>(
    () =>
      feeds
        .filter(f => f)
        .flatMap(f => f.items)
        .filter(n => {
          if (n.date_published < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) return false;
          else if (!isAdmin && isNewService(n) === false) return false;
          else if (!isAdmin && isNewSystemVersion(n) === 'newer') return false;
          else return true;
        })
        .sort((a, b) => b.date_published.getTime() - a.date_published.getTime())
        .map(n => ({
          ...n,
          _isNew: n.date_published > lastTimeOpen,
          tags: []
            .concat(isNewService(n) ? ['new'] : [])
            .concat(isAdmin && isNewService(n) === false ? ['new'] : [])
            .concat(isAdmin && isNewSystemVersion(n) === 'newer' ? ['new'] : [])
            .concat(isAdmin && isNewSystemVersion(n) === 'current' ? ['current'] : [])
            .concat(n.tags)
        })),
    [feeds, isAdmin, isNewService, isNewSystemVersion, lastTimeOpen]
  );

  return notifications;
};
