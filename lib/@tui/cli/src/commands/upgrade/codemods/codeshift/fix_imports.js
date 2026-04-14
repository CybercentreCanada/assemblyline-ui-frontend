/* eslint-env node */

const IMPORTS_MAPS = [
  {
    from: 'commons/components/app/hooks',
    subpathMap: {
      useAppDrawer: '@tui/drawer',
      useAppSwitcher: '@tui/apps',
      useAppNotification: '@tui/notis',
      AppSwitcherItem: '@tui/apps',
      default: '@tui/core'
    }
  },
  { from: 'commons/components', to: '@tui/core' },
  { from: 'commons/remix/breadcrumbs', to: '@tui/core' },
  { from: 'commons/addons', to: 'addons', preserveSubpath: true },
  { from: 'commons/branding', to: 'branding', preserveSubpath: true }
];

module.exports.parser = 'tsx';

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let didChange = false;

  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (typeof source !== 'string') return;

    // Pick longest match first
    const importMapDef = IMPORTS_MAPS.slice()
      .sort((a, b) => b.from.length - a.from.length)
      .find(def => source === def.from || source.startsWith(`${def.from}/`));

    if (!importMapDef) return;

    // ---------------------------------------------
    // Full replacement
    // ---------------------------------------------
    if (importMapDef.replaceWith) {
      const replacement = j(templateToAST(j, importMapDef.replaceWith));
      j(path).replaceWith(replacement);
      didChange = true;
      return;
    }

    // ---------------------------------------------
    // Compute subpath if needed
    // ---------------------------------------------
    let subpath = '';
    if (source.length > importMapDef.from.length) {
      subpath = source.slice(importMapDef.from.length).replace(/^\/+/, '');
    }

    // ---------------------------------------------
    // Side-effect-only imports
    // ---------------------------------------------
    if (path.node.specifiers.length === 0) {
      let newSource = importMapDef.to || source;
      if (importMapDef.preserveSubpath && subpath) {
        newSource = `${importMapDef.to}${subpath.startsWith('/') ? '' : '/'}${subpath}`;
      }
      j(path).replaceWith(j.importDeclaration([], j.literal(newSource)));
      didChange = true;
      return;
    }

    // ---------------------------------------------
    // Handle named imports with subpathMap
    // ---------------------------------------------
    if (importMapDef.subpathMap) {
      const newImports = [];

      path.node.specifiers.forEach(spec => {
        if (spec.type === 'ImportSpecifier') {
          const imported = spec.imported.name;
          const local = spec.local?.name || imported;
          const mappedSource = importMapDef.subpathMap[imported] || importMapDef.subpathMap.default || source;
          const newSpec = j.importSpecifier(j.identifier(imported), imported === local ? null : j.identifier(local));
          newImports.push(j.importDeclaration([newSpec], j.literal(mappedSource)));
        } else {
          // Default or namespace import
          const newSource = importMapDef.subpathMap.default || importMapDef.to || source;
          newImports.push(j.importDeclaration([spec], j.literal(newSource)));
        }
      });

      j(path).replaceWith(newImports);
      didChange = true;
      return;
    }

    // ---------------------------------------------
    // Handle preserveSubpath or normal remap
    // ---------------------------------------------
    let newSource = importMapDef.to || source;
    if (importMapDef.preserveSubpath && subpath) {
      newSource = `${importMapDef.to}${subpath.startsWith('/') ? '' : '/'}${subpath}`;
    }

    j(path).replaceWith(j.importDeclaration(path.node.specifiers, j.literal(newSource)));
    didChange = true;
  });

  return didChange ? root.toSource({ quote: 'single', reuseWhitespace: true }) : null;
};

// --------------------------------------------------
// Helper: convert code string to AST nodes
// --------------------------------------------------
function templateToAST(j, code) {
  const parsed = j(code);
  return parsed.nodes();
}
