/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import useSorters from '../hooks/useSorters';
import { SorterField } from './SorterSelector';

const useStyles = makeStyles({
  sorterTrigger: {
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer'
    }
  }
});

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
  const classes = useStyles();
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
    <div className={`${classes.sorterTrigger} ${className}`} onClick={onClick}>
      {label ?? (sorter.i18nKey ? t(sorter.i18nKey) : sorter.label)}&nbsp;
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
    </div>
  );
};

export default SorterTrigger;
