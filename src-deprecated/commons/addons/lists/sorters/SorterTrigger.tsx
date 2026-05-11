import { styled, useMediaQuery, useTheme } from '@mui/material';
import useSorters from 'commons/addons/lists/hooks/useSorters';
import type { SorterField } from 'commons/addons/lists/sorters/SorterSelector';
import { useTranslation } from 'react-i18next';

const SortTrigger = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    cursor: 'pointer'
  }
}));

export interface SorterTriggerProps {
  label?: string;
  sorter: SorterField;
  sorters: SorterField[];
  className?: string;
  onSort: (action: 'apply' | 'next' | 'remove' | 'remove-all', sorter?: SorterField) => void;
}

const SorterTrigger = ({ label, sorter, sorters, className, onSort }: SorterTriggerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMd = useMediaQuery(theme.breakpoints.down('lg'));
  const { icon, nextState } = useSorters();

  // ordinal position of sorter.
  const position = sorters.findIndex(cs => cs.id === sorter.id);

  // is it last?
  const isLast = sorters[sorters.length - 1]?.id === sorter.id;

  // onclick sort handler.
  const onClick = () => {
    onSort(nextState(sorter) === 'unset' && isLast ? 'remove' : 'next', sorter);
  };

  return (
    <SortTrigger className={className} onClick={onClick}>
      {label ?? (sorter.i18nKey ? t(sorter.i18nKey) : sorter.label)}
      &nbsp;
      {isMd ? (
        /* Stack the number and arrow for smaller resolutions */
        <div>
          {/* display: flex -> fixes slight vertical miss-alignment. */}
          <div style={{ display: 'flex' }}>{position > -1 && icon(sorter.state)}</div>
          <div>{position > -1 && sorters.length > 1 && <em>({position + 1})</em>}</div>
        </div>
      ) : (
        /* Put the number and arrow next to eachother for larger resolutions */
        <>
          {position > -1 && <>{icon(sorter.state)}</>}
          {position > -1 && sorters.length > 1 && <em>({position + 1})</em>}
        </>
      )}
    </SortTrigger>
  );
};

export default SorterTrigger;
