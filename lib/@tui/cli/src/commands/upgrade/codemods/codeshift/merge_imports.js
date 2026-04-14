/* eslint-env node */

module.exports.parser = 'tsx';

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const valueSpecifiers = new Map(); // name -> ImportSpecifier
  const typeSpecifiers = new Map();

  let hasChanges = false;

  // Step 1: collect + remove old imports
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (typeof source !== 'string') return;

    const isCommons = source.startsWith('commons/components');
    const isTuiCore = source === '@tui/core';

    if (!isCommons && !isTuiCore) return;

    path.node.specifiers.forEach(spec => {
      // Ignore namespace imports (rare, but safe)
      if (spec.type !== 'ImportSpecifier' && spec.type !== 'ImportDefaultSpecifier') {
        return;
      }

      const importedName = spec.type === 'ImportDefaultSpecifier' ? spec.local.name : spec.imported.name;

      const localName = spec.local?.name || importedName;

      const newSpecifier =
        spec.type === 'ImportDefaultSpecifier'
          ? j.importSpecifier(j.identifier(importedName))
          : j.importSpecifier(j.identifier(importedName), importedName === localName ? null : j.identifier(localName));

      const isType = spec.importKind === 'type' || path.node.importKind === 'type';

      const targetMap = isType ? typeSpecifiers : valueSpecifiers;

      if (!targetMap.has(localName)) {
        targetMap.set(localName, newSpecifier);
      }
    });

    j(path).remove();
    hasChanges = true;
  });

  if (!hasChanges) return null;

  const newImports = [];

  // Step 2: emit merged value import
  if (valueSpecifiers.size > 0) {
    newImports.push(j.importDeclaration(Array.from(valueSpecifiers.values()), j.literal('@tui/core')));
  }

  // Step 3: emit merged type import
  if (typeSpecifiers.size > 0) {
    const typeImport = j.importDeclaration(Array.from(typeSpecifiers.values()), j.literal('@tui/core'));
    typeImport.importKind = 'type'; // declaration-level ONLY
    newImports.push(typeImport);
  }

  // Step 4: insert at top of file
  const firstImport = root.find(j.ImportDeclaration).at(0);

  if (firstImport.size() > 0) {
    firstImport.insertBefore(newImports);
  } else {
    root.get().node.program.body.unshift(...newImports);
  }

  return root.toSource({
    quote: 'single',
    reuseWhitespace: true,
    trailingComma: false
  });
};
