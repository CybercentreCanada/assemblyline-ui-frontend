import { IconButton, Tooltip } from '@mui/material';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import Tag from 'components/visual/Tag';
import { verdictRank } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Heuristic from './Heuristic';

type TagProps = {
  value: string;
  lvl: string;
  safelisted: boolean;
  classification: string;
};

type AutoHideTagListProps = {
  tag_type: string;
  items: TagProps[];
  force?: boolean;
  targetMax?: number;
};

type AutoHideTagListState = {
  showExtra: boolean;
  fullTagList: TagProps[];
};

export function detailedTagCompare(a: TagProps, b: TagProps) {
  const aVerdict = a.safelisted ? 4 : verdictRank(a.lvl);
  const bVerdict = b.safelisted ? 4 : verdictRank(b.lvl);

  if (aVerdict === bVerdict) {
    return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
  } else {
    return aVerdict < bVerdict ? -1 : 1;
  }
}

const WrappedAutoHideTagList: React.FC<AutoHideTagListProps> = ({ tag_type, items, force = false, targetMax = 10 }) => {
  const { t } = useTranslation();
  const { getKey } = useHighlighter();
  const [state, setState] = useState<AutoHideTagListState | null>(null);
  const [shownTags, setShownChips] = useState<TagProps[]>([]);
  const { showSafeResults } = useSafeResults();

  useEffect(() => {
    const fullTagList =
      showSafeResults || force
        ? items.sort(detailedTagCompare)
        : items.filter(item => !item.safelisted).sort(detailedTagCompare);
    const showExtra = fullTagList.length <= targetMax;

    setState({ showExtra, fullTagList });
  }, [items, targetMax, force, showSafeResults]);

  useEffect(() => {
    if (state !== null) {
      if (state.showExtra) {
        setShownChips(state.fullTagList);
      } else {
        setShownChips(state.fullTagList.slice(0, targetMax));
      }
    }
  }, [state, targetMax]);

  return (
    <>
      {shownTags.map((tag, idx) =>
        tag_type === 'heuristic.signature' ? (
          <Heuristic
            key={idx}
            signature
            text={tag.value}
            lvl={tag.lvl}
            highlight_key={getKey('heuristic.signature', tag.value)}
            safe={tag.safelisted}
            force={force}
          />
        ) : (
          <Tag
            key={idx}
            value={tag.value}
            classification={tag.classification}
            safelisted={tag.safelisted}
            type={tag_type}
            lvl={tag.lvl}
            highlight_key={getKey(tag_type, tag.value)}
            force={force}
          />
        )
      )}
      {state && !state.showExtra && (
        <Tooltip title={t('more')}>
          <IconButton size="small" onClick={() => setState({ ...state, showExtra: true })} style={{ padding: 0 }}>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

const AutoHideTagList = React.memo(WrappedAutoHideTagList);
export default AutoHideTagList;
