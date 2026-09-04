import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import type { Verdict } from 'components/models/base/alert';
import CustomChip from 'components/visual/CustomChip';
import Heuristic from 'components/visual/Heuristic';
import Tag from 'components/visual/Tag';
import { SECOND_LEVEL_DOMAINS } from 'helpers/2LD';
import { verdictRank, verdictToColor } from 'helpers/utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

const getVerdict = (t: TagProps) => (t.safelisted ? 4 : verdictRank(t.lvl));

export const compareTags = (a: TagProps, b: TagProps): number => {
  const diff = getVerdict(a) - getVerdict(b);
  return diff || (a.value < b.value ? -1 : a.value > b.value ? 1 : 0);
};

export const compareIPs = (a: TagProps, b: TagProps): number => {
  const diff = getVerdict(a) - getVerdict(b);
  if (diff) return diff;

  const aParts = a.value.split('.');
  const bParts = b.value.split('.');
  for (let i = 0; i < 4; i++) {
    const pa = +aParts[i];
    const pb = +bParts[i];
    if (pa !== pb) return pa - pb;
  }
  return 0;
};

export const compareDomains = (a: TagProps, b: TagProps): number => {
  const diff = getVerdict(a) - getVerdict(b);
  if (diff) return diff;

  const aParts = a.value.split('.');
  const bParts = b.value.split('.');
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 1; i <= len; i++) {
    const pa = aParts[aParts.length - i] ?? '';
    const pb = bParts[bParts.length - i] ?? '';
    if (pa !== pb) return pa.localeCompare(pb);
  }
  return 0;
};

export const compareURLs = (a: TagProps, b: TagProps): number => {
  const diff = getVerdict(a) - getVerdict(b);
  if (diff) return diff;

  try {
    const urlA = new URL(a.value);
    const urlB = new URL(b.value);

    const hostA = urlA.hostname.split('.');
    const hostB = urlB.hostname.split('.');

    const keyA = hostA.slice(-2).join('.');
    const keyB = hostB.slice(-2).join('.');
    if (keyA !== keyB) return keyA.localeCompare(keyB);

    const len = Math.max(hostA.length, hostB.length);
    for (let i = 1; i <= len; i++) {
      const pa = hostA[hostA.length - i] ?? '';
      const pb = hostB[hostB.length - i] ?? '';
      if (pa !== pb) return pa.localeCompare(pb);
    }

    return urlA.href.localeCompare(urlB.href);
  } catch {
    return a.value.localeCompare(b.value);
  }
};

const getDomainKey = (parts: string[], isURL = false) => {
  const tld = parts[parts.length - 1];
  const sld = parts[parts.length - 2];

  if (sld && `${sld}.${tld}` in SECOND_LEVEL_DOMAINS) {
    return isURL ? parts.slice(-3).join('.') : `${sld}.${tld}`;
  }
  return isURL ? parts.slice(-2).join('.') : tld;
};

export const groupDomains = (prev: Record<number, Record<string, TagProps[]>>, current: TagProps) => {
  const verdict = current.safelisted ? 4 : verdictRank(current.lvl);
  const parts = current.value.split('.');
  const key = getDomainKey(parts);

  prev[verdict] ??= {};
  (prev[verdict][key] ??= []).push(current);

  return prev;
};

export const groupURLs = (prev: Record<number, Record<string, TagProps[]>>, current: TagProps) => {
  const verdict = current.safelisted ? 4 : verdictRank(current.lvl);
  const parts = new URL(current.value).hostname.split('.');
  const key = getDomainKey(parts, true);

  prev[verdict] ??= {};
  (prev[verdict][key] ??= []).push(current);

  return prev;
};

type TagListProps = {
  items: TagProps[];
  totalMax?: number;
  children?: (tag: TagProps, index: number) => React.ReactNode;
};

const TagList: React.FC<TagListProps> = React.memo(({ items, totalMax = 10, children = () => null }: TagListProps) => (
  <>
    {items.slice(0, totalMax).map((tag, idx) => children(tag, idx))}
    <ShowMore open={items.length <= totalMax} count={items.length - totalMax}>
      {items.slice(totalMax).map((tag, idx) => children(tag, idx))}
    </ShowMore>
  </>
));

type GroupedTagListProps = {
  items: TagProps[];
  groupMax?: number;
  totalMax?: number;
  groupMethod?: (
    previousValue: Record<number, Record<string, TagProps[]>>,
    currentValue: TagProps,
    currentIndex: number
  ) => Record<number, Record<string, TagProps[]>>;
  children?: (tag: TagProps, index: number) => React.ReactNode;
};

const GroupedTagList: React.FC<GroupedTagListProps> = React.memo(
  ({
    items = [],
    groupMax = 5,
    totalMax = 10,
    groupMethod = () => null,
    children = () => null
  }: GroupedTagListProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const [hideExtra, setHideExtra] = useState<boolean>(true);

    return hideExtra ? (
      <>
        {items.slice(0, totalMax).map((tag, idx) => children(tag, idx))}
        {items.length > totalMax && (
          <Tooltip title={`${items.length - totalMax} ${t('show_more.count')}`}>
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

              {tags.slice(0, groupMax).map((tag, idx) => children(tag, idx))}
              <ShowMore open={tags.length <= groupMax} count={tags.length - groupMax}>
                {tags.slice(groupMax).map((tag, idx) => children(tag, idx))}
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
  groupMax?: number;
  totalMax?: number;
};

export const AutoHideTagList: React.FC<AutoHideTagListProps> = React.memo(
  ({ tag_type, items, groupMax = 5, totalMax = 10, force = false }: AutoHideTagListProps) => {
    const { getKey } = useHighlighter();
    const { showSafeResults } = useSafeResults();

    if (tag_type === 'heuristic.signature')
      return (
        <TagList
          items={items.filter(tag => showSafeResults || force || !tag.safelisted).sort(compareTags)}
          totalMax={totalMax}
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
          totalMax={totalMax}
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
        <GroupedTagList
          items={items.sort(compareDomains)}
          groupMethod={groupDomains}
          groupMax={groupMax}
          totalMax={totalMax}
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
        </GroupedTagList>
      );
    else if (URI_KEYS.includes(tag_type))
      return (
        <GroupedTagList items={items.sort(compareURLs)} groupMethod={groupURLs} groupMax={groupMax} totalMax={totalMax}>
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
          totalMax={totalMax}
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
