import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction
} from 'react';
import type { OverlayProps } from '.';

export type OverlayContextType = {
  actives: string[];
  regions: string[];
  regionProps: OverlayProps[];
  activeProps: OverlayProps[];
  setActives: Dispatch<SetStateAction<string[]>>;
  setRegions: Dispatch<SetStateAction<string[]>>;
  setActiveProps: Dispatch<SetStateAction<OverlayProps[]>>;
  setRegionProps: Dispatch<SetStateAction<OverlayProps[]>>;
  toggleActive: (active: string) => void;
  toggleRegion: (region: string) => void;
};

export const OverlayDefs = [
  { region: 'layout', description: 'The core layout elements' },
  { region: 'slot', description: 'The slots injection points' }
];

export const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider: FC<PropsWithChildren> = ({ children }) => {
  const [actives, setActives] = useState<string[]>([]);
  const [activeProps, setActiveProps] = useState<OverlayProps[]>([]);

  const [regions, setRegions] = useState<string[]>([]);
  const [regionProps, setRegionProps] = useState<OverlayProps[]>([]);

  const toggleRegion = useCallback(
    (region: string) => {
      setRegions(_regions => {
        if (_regions.includes(region)) {
          return _regions.filter(_region => _region !== region);
        }
        return [..._regions, region];
      });
    },
    [setRegions]
  );

  const toggleActive = useCallback(
    (active: string) => {
      setActives(_actives => {
        if (_actives.includes(active)) {
          return _actives.filter(_active => _active !== active);
        }
        return [..._actives, active];
      });
    },
    [setActives]
  );

  const queryRegions: () => OverlayProps[] = useCallback(() => {
    let rCount = 0;
    return regions
      .map(region => {
        const elements: NodeListOf<HTMLElement> = document.querySelectorAll(`[data-layout-region="${region}"]`);
        return Array.from(elements)
          .filter(el => !!el.dataset.layoutId && !!el.dataset.layoutRegion)
          .map(el => {
            const rect = el.getBoundingClientRect();
            return {
              id: el.dataset.layoutId,
              region: el.dataset.layoutRegion,
              label: `o-${rCount++}`,
              description: el.dataset.layoutId,
              rect
            };
          });
      })
      .flat();
  }, [regions]);

  const queryActives: () => OverlayProps[] = useCallback(() => {
    let rCount = 0;
    return actives
      .map(_id => {
        const elements: NodeListOf<HTMLElement> = document.querySelectorAll(`[data-layout-id="${_id}"]`);
        return Array.from(elements)
          .filter(el => !!el.dataset.layoutId && !!el.dataset.layoutRegion)
          .map(el => {
            const rect = el.getBoundingClientRect();
            return {
              id: el.dataset.layoutId,
              region: el.dataset.layoutRegion,
              label: `o-${rCount++}`,
              description: el.dataset.layoutId,
              rect
            };
          });
      })
      .flat();
  }, [actives]);

  useEffect(() => {
    if (regions.length === 0) {
      setRegionProps([]);
      return;
    }

    setRegionProps(queryRegions());
  }, [regions, queryRegions]);

  useEffect(() => {
    if (regionProps.length === 0) {
      setActives([]);
      return;
    }

    setActives(_actives => _actives.filter(a => regionProps.some(r => r.id === a)));
  }, [regionProps]);

  useEffect(() => {
    if (actives?.length === 0) {
      setActiveProps([]);
      return;
    }
    setActiveProps(queryActives());
  }, [actives, queryActives]);

  const value = useMemo(
    () => ({
      actives,
      regions,
      activeProps,
      regionProps,
      setActives,
      setRegions,
      setActiveProps,
      setRegionProps,
      toggleActive,
      toggleRegion
    }),
    [activeProps, actives, regionProps, regions, toggleActive, toggleRegion]
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
};
