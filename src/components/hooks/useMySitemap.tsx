// isRoot[true] -> indicates that the breadcrumbs will reset to this one path each time it is encountered.
// isLeaf[true] -> indicates that this path will be replaced by the next path that is encoutered.
// The remaining paths will aggregate.  If a path is encountered that is already in the breadcrumbs history, then
//  the breadcrumbs history will rollback to that path and the ones coming after will be removed.
export default function useMySitemap() {
  return {
    exceptLast: false,
    allLinks: false,
    lastOnly: false,
    routes: []
  };
}
