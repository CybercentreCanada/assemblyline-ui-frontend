import { Grid } from '@mui/material';
import { PageWithToC, ToCAnchor } from 'commons/addons/toc/Toc2';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type List = { label: string; level: number };

type Item = {
  label: string;
  subItems?: Item[];
};

export const Test = () => {
  const { t } = useTranslation();

  const titles = useMemo(() => [...Array(100)].map((_, i) => i), []);

  const toc = useMemo<List[]>(
    () => [
      { label: '1', level: 0 },
      { label: '1.1', level: 1 },
      { label: '1.2', level: 1 },
      { label: '1.3', level: 1 },
      { label: '2', level: 0 },
      { label: '3', level: 0 },
      { label: '4', level: 0 },
      { label: '5', level: 0 },
      { label: '6', level: 0 },
      { label: '7', level: 0 },
      { label: '8', level: 0 },
      { label: '9', level: 0 }
    ],
    []
  );

  const format = useCallback((data: List[], currentLevel: number, result: Item[]): Item[] => {
    if (!Array.isArray(data) || data.length === 0) return result;

    const item = data[0];

    console.log(item, currentLevel, result);

    // Same Level
    if (item.level === currentLevel) {
      result = [...result, { label: item.label, subItems: [] }];
      return format(data.slice(1), currentLevel, result);
    }

    // Lower Level
    else if (item.level > currentLevel) {
      const newSubResult = format(data.slice(1), item.level, [{ label: item.label, subItems: [] }]);
      result[result.length - 1].subItems = newSubResult;
      return format(data.slice(1), currentLevel, result);
    }

    // Higher Level
    // else if (item.level < currentLevel) {
    //   return format(data.slice(1), item.level, result);
    // }

    // Else
    else return result;
  }, []);

  const formatTOC = useCallback(
    (data: List[]): Item[] => {
      return format(data, data[0].level, []);
    },
    [format]
  );

  useEffect(() => {
    const newToc = formatTOC(toc);
    console.log(newToc, toc);
  }, [format, formatTOC, toc]);

  return (
    <PageWithToC>
      <Grid container alignItems="center">
        {toc.map(item => (
          <Grid key={item.label} item xs={12}>
            <ToCAnchor label={item.label} level={item.level}>
              {item.label}
            </ToCAnchor>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam fermentum fermentum est, ut dignissim urna
              finibus vitae. Vestibulum facilisis nunc vel porta porttitor. Maecenas condimentum lectus semper,
              malesuada leo a, lacinia dolor. Vestibulum in congue lectus. In sed lorem sed risus aliquet varius at et
              est. Duis et sem hendrerit libero lacinia dapibus. Nam ac purus magna. Morbi ut sapien sed massa congue
              posuere. Sed congue eros sed sapien scelerisque elementum.
            </p>
            <p>
              Curabitur cursus accumsan leo nec tempus. Praesent massa tellus, posuere at consequat in, dignissim sit
              amet libero. Aliquam ut nisl eget orci tempor rutrum ac nec velit. Ut lorem felis, dapibus eget maximus
              eget, aliquam non elit. Aenean laoreet, augue placerat sollicitudin pretium, orci mi sodales lacus, at
              dignissim eros felis ut quam. Aliquam erat volutpat. Duis tempus risus elit, in tincidunt mi venenatis
              nec.
            </p>
            <p>
              Aenean luctus libero ipsum. Sed ultricies tempor feugiat. Vestibulum tellus felis, consectetur id
              venenatis pulvinar, aliquam id libero. Quisque mattis libero a faucibus ultrices. Phasellus tristique arcu
              vitae feugiat ullamcorper. Ut porttitor justo odio, eu aliquet leo vehicula at. Sed eget luctus odio.
              Pellentesque lacus mauris, egestas quis ex vel, euismod pretium dolor. Aliquam finibus dui nec tellus
              tincidunt blandit.
            </p>
            <p>
              Proin vitae nunc vulputate, posuere leo vel, eleifend urna. Vestibulum sed urna ac dolor feugiat
              condimentum id ac justo. Sed non justo porttitor justo placerat pellentesque ac eget odio. Sed eget
              sodales mi. Donec orci purus, dignissim in libero in, faucibus interdum nisl. Morbi eu lacinia nisi.
              Integer non velit quis purus vestibulum egestas. Phasellus sed nisl pharetra, dapibus metus sit amet,
              porttitor augue. Aliquam eu viverra justo. Nunc fermentum velit fringilla egestas dignissim. Morbi nec
              nisl commodo, euismod tortor et, dictum mi. In consequat tempus augue, at malesuada erat aliquet quis.
              Quisque imperdiet eros et metus tristique, id ultricies leo facilisis. Donec consectetur odio magna, eu
              egestas justo elementum vitae. Nunc sit amet lorem ante.
            </p>
            <p>
              Etiam fermentum varius tortor eget tincidunt. Phasellus eleifend aliquet luctus. Maecenas elit velit,
              interdum sit amet odio eu, venenatis molestie nisl. Nam ut molestie sem, non venenatis dolor. Phasellus
              semper, sem eu dictum maximus, ante eros pretium ligula, eget aliquet nibh tellus in metus. Proin varius
              nisl eget efficitur suscipit. Curabitur sem lectus, posuere posuere elit fringilla, elementum lacinia
              urna. Aenean a leo at nunc convallis elementum quis vitae libero. Duis aliquet ac leo sed pulvinar.
            </p>
          </Grid>
        ))}
      </Grid>
    </PageWithToC>
  );
};

export default memo(Test);
