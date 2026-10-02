import type { SubmissionTree, Tree } from 'models/api/submission';

//*****************************************************************************************
// Visibility
//*****************************************************************************************

/**
 * @name isFileTreeItemVisible
 * @description Determines whether a file tree item or any of its descendants should be displayed.
 * @param item - File tree item to evaluate
 * @param forcedShown - SHA256 values explicitly expanded by the user
 * @param highlightedKeys - Highlighted SHA256 values
 * @param showSafeResults - Whether safe files should be visible
 * @returns Whether the item should be displayed
 */
export const isFileTreeItemVisible = (
  item: Tree,
  forcedShown: string[],
  highlightedKeys: Set<string>,
  showSafeResults: boolean
): boolean =>
  (item.score < 0 && !showSafeResults) ||
  item.score > 0 ||
  (!!item.sha256 && (forcedShown.includes(item.sha256) || highlightedKeys.has(item.sha256))) ||
  Object.values(item.children).some(child =>
    isFileTreeItemVisible(child, forcedShown, highlightedKeys, showSafeResults)
  );

//*****************************************************************************************
// Key Construction
//*****************************************************************************************

/**
 * @name getFileTreeKeys
 * @description Returns every SHA256 map key in a file tree, including descendants.
 * @param tree - File tree to traverse
 * @returns SHA256 keys in depth-first order
 */
export const getFileTreeKeys = (tree: SubmissionTree['tree']): string[] =>
  Object.entries(tree).flatMap(([sha256, item]) => [sha256, ...getFileTreeKeys(item.children)]);
