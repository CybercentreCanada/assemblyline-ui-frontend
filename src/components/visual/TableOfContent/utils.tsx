import { NodeDef } from './Provider';

export const getValueFromPath = (_nodes: NodeDef[] = null, _path: number[] = []): NodeDef => {
  if (!_nodes || !_path) return undefined;
  else if (_path.length > 1) return getValueFromPath(_nodes[_path[0]].subNodes, _path.slice(1));
  else if (_path.length === 1) return _nodes[_path[0]];
  else return undefined;
};

export const setValueFromPath = (
  _nodes: NodeDef[],
  _path: number[],
  { key, value }: { key: any; value: any }
): NodeDef[] => {
  if (Array.isArray(_path) && _path.length <= 1) _nodes[_path[0]] = { ..._nodes[_path[0]], [key]: value };
  else if (_nodes[_path[0]] && 'subNodes' in _nodes[_path[0]])
    _nodes[_path[0]].subNodes = setValueFromPath(_nodes[_path[0]].subNodes, _path.slice(1), { key, value });
  return _nodes;
};

export const arrayEquals = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);

export const arraySubset = (a, b) => Array.isArray(a) && Array.isArray(b) && a.every((val, index) => val === b[index]);
