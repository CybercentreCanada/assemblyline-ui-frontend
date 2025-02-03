import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import type { Verdict } from 'components/models/base/alert';
import Tag from 'components/visual/Tag';
import { verdictRank, verdictToColor } from 'helpers/utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomChip from './CustomChip';
import Heuristic from './Heuristic';

const DOMAIN_KEYS = ['network.static.domain', 'network.dynamic.domain'];
const IP_KEYS = ['network.static.ip', 'network.dynamic.ip'];
const URI_KEYS = ['network.static.uri', 'network.dynamic.uri'];

type TagProps = {
  value: string;
  lvl: Verdict;
  safelisted: boolean;
  classification?: string;
};

type ShowMoreProps = {
  open: boolean;
  count: number;
  children?: React.ReactNode;
};

const ShowMore: React.FC<ShowMoreProps> = React.memo(
  ({ open = false, count = null, children = null }: ShowMoreProps) => {
    const { t } = useTranslation();

    const [showMore, setShowMore] = useState<boolean>(open);

    return !showMore ? (
      <Tooltip title={`${count} ${t('show_more.count')}`}>
        <IconButton size="small" onClick={() => setShowMore(true)} style={{ padding: 0 }}>
          <MoreHorizOutlinedIcon />
        </IconButton>
      </Tooltip>
    ) : (
      children
    );
  }
);

const compareTags = (a: TagProps, b: TagProps) => {
  const aVerdict = a.safelisted ? 4 : verdictRank(a.lvl);
  const bVerdict = b.safelisted ? 4 : verdictRank(b.lvl);

  const verdictComparison = aVerdict - bVerdict;
  if (verdictComparison !== 0) return verdictComparison;
  else return a.value.localeCompare(b.value);
};

const compareIPs = (a: TagProps, b: TagProps) => {
  const aVerdict = a.safelisted ? 4 : verdictRank(a.lvl);
  const bVerdict = b.safelisted ? 4 : verdictRank(b.lvl);

  const verdictComparison = aVerdict - bVerdict;
  if (verdictComparison !== 0) return verdictComparison;

  const ipA = a.value.split('.').map(v => Number(v));
  const ipB = b.value.split('.').map(v => Number(v));

  for (let i = 0; i < ipA.length; i++) {
    if (ipA[i] !== ipB[i]) return ipA[i] - ipB[i];
  }
};

const compareDomains = (a: TagProps, b: TagProps) => {
  const aVerdict = a.safelisted ? 4 : verdictRank(a.lvl);
  const bVerdict = b.safelisted ? 4 : verdictRank(b.lvl);

  const verdictComparison = aVerdict - bVerdict;
  if (verdictComparison !== 0) return verdictComparison;

  const reversedA = a.value.split('.').reverse().join('.');
  const reversedB = b.value.split('.').reverse().join('.');
  return reversedA.localeCompare(reversedB);
};

const compareURLs = (a: TagProps, b: TagProps) => {
  const aVerdict = a.safelisted ? 4 : verdictRank(a.lvl);
  const bVerdict = b.safelisted ? 4 : verdictRank(b.lvl);

  const verdictComparison = aVerdict - bVerdict;
  if (verdictComparison !== 0) return verdictComparison;

  try {
    const urlA = new URL(a.value);
    const urlB = new URL(b.value);

    const keyA = urlA.hostname.split('.').slice(-2).join('.');
    const keyB = urlB.hostname.split('.').slice(-2).join('.');
    if (keyA !== keyB) return keyA.localeCompare(keyB);

    urlA.hostname = urlA.hostname.split('.').reverse().join('.');
    urlB.hostname = urlB.hostname.split('.').reverse().join('.');
    return urlA.href.localeCompare(urlB.href);
  } catch (e) {
    return a.value.localeCompare(b.value);
  }
};

const groupDomains = (prev: { [verdict: number]: { [key: string]: TagProps[] } }, current: TagProps) => {
  const verdict = current.safelisted ? 4 : verdictRank(current.lvl);
  const key = current.value.split('.').pop();
  return { ...prev, [verdict]: { ...prev?.[verdict], [key]: [...(prev?.[verdict]?.[key] || []), current] } };
};

const groupURLs = (prev: { [verdict: number]: { [key: string]: TagProps[] } }, current: TagProps) => {
  const verdict = current.safelisted ? 4 : verdictRank(current.lvl);
  const key = new URL(current.value).hostname.split('.').slice(-2).join('.');
  return { ...prev, [verdict]: { ...prev?.[verdict], [key]: [...(prev?.[verdict]?.[key] || []), current] } };
};

type TagListProps = {
  items: TagProps[];
  targetMax?: number;
  children?: (tag: TagProps, index: number) => React.ReactNode;
};

const TagList: React.FC<TagListProps> = React.memo(({ items, targetMax = 10, children = () => null }: TagListProps) => (
  <>
    {items.slice(0, targetMax).map((tag, idx) => children(tag, idx))}
    <ShowMore open={items.length <= targetMax} count={items.length - targetMax}>
      {items.slice(targetMax).map((tag, idx) => children(tag, idx))}
    </ShowMore>
  </>
));

type GroupedTagListProps = {
  items: TagProps[];
  targetMax?: number;
  groupMethod?: (
    previousValue: { [verdict: number]: { [key: string]: TagProps[] } },
    currentValue: TagProps,
    currentIndex: number
  ) => { [verdict: number]: { [key: string]: TagProps[] } };
  children?: (tag: TagProps, index: number) => React.ReactNode;
};

const GroupedTagList: React.FC<GroupedTagListProps> = React.memo(
  ({ items = [], targetMax = 10, groupMethod = () => null, children = () => null }: GroupedTagListProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const [hideExtra, setHideExtra] = useState<boolean>(true);

    return hideExtra ? (
      <>
        {items.slice(0, targetMax).map((tag, idx) => children(tag, idx))}
        {items.length > targetMax && (
          <Tooltip title={`${items.length - targetMax} ${t('show_more.count')}`}>
            <IconButton size="small" onClick={() => setHideExtra(false)} style={{ padding: 0 }}>
              <MoreHorizOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}
      </>
    ) : (
      Object.entries(items.reduce(groupMethod, {})).map(([, value], i) => (
        <div key={`${i}`} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {Object.entries(value).map(([key, tags], j) => (
            <div
              key={`${i}-${j}`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: theme.spacing(1),
                marginRight: theme.spacing(2)
              }}
            >
              <CustomChip
                label={key}
                size="small"
                variant="filled"
                type="rounded"
                color={tags?.[0].safelisted ? 'success' : verdictToColor(tags?.[0].lvl)}
                sx={{ textTransform: 'uppercase' }}
                style={{ marginRight: theme.spacing(1) }}
              />

              {tags.slice(0, targetMax).map((tag, idx) => children(tag, idx))}
              <ShowMore open={tags.length <= targetMax} count={tags.length - targetMax}>
                {tags.slice(targetMax).map((tag, idx) => children(tag, idx))}
              </ShowMore>
            </div>
          ))}
        </div>
      ))
    );
  }
);

type AutoHideTagListProps = {
  tag_type: string;
  items: TagProps[];
  force?: boolean;
  targetMax?: number;
};

export const AutoHideTagList: React.FC<AutoHideTagListProps> = React.memo(
  ({ tag_type, items, targetMax = 10, force = false }: AutoHideTagListProps) => {
    const { getKey } = useHighlighter();
    const { showSafeResults } = useSafeResults();

    if (tag_type === 'heuristic.signature')
      return (
        <TagList
          items={items.filter(tag => showSafeResults || force || !tag.safelisted).sort(compareTags)}
          targetMax={targetMax}
        >
          {(tag, idx) => (
            <Heuristic
              key={idx}
              signature
              text={tag.value}
              lvl={tag.lvl}
              highlight_key={getKey('heuristic.signature', tag.value)}
              safe={tag.safelisted}
              force={force}
            />
          )}
        </TagList>
      );
    else if (IP_KEYS.includes(tag_type))
      return (
        <TagList
          items={items.filter(tag => showSafeResults || force || !tag.safelisted).sort(compareIPs)}
          targetMax={targetMax}
        >
          {(tag, idx) => (
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
          )}
        </TagList>
      );
    else if (DOMAIN_KEYS.includes(tag_type))
      return (
        <GroupedTagList items={items.sort(compareDomains)} groupMethod={groupDomains} targetMax={targetMax}>
          {(tag, idx) => (
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
          )}
        </GroupedTagList>
      );
    else if (URI_KEYS.includes(tag_type))
      return (
        <GroupedTagList items={items.sort(compareURLs)} groupMethod={groupURLs} targetMax={targetMax}>
          {(tag, idx) => (
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
          )}
        </GroupedTagList>
      );
    else
      return (
        <TagList
          items={items.filter(tag => showSafeResults || force || !tag.safelisted).sort(compareTags)}
          targetMax={targetMax}
        >
          {(tag, idx) => (
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
          )}
        </TagList>
      );
  }
);

export default AutoHideTagList;
