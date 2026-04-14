#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const EXPORTS_JSON = path.resolve(__dirname, 'exports.json');

if (!fs.existsSync(EXPORTS_JSON)) {
  throw new Error(`Missing exports.json at ${EXPORTS_JSON}`);
}
const mergedExports = JSON.parse(fs.readFileSync(EXPORTS_JSON, 'utf-8'));

/**
 * Find which module an import belongs to
 * @param {string} name
 */
function getTargetModule(name) {
  for (const mod in mergedExports) {
    if (Object.prototype.hasOwnProperty.call(mergedExports[mod], name)) {
      return { module: mod, kind: mergedExports[mod][name] };
    }
  }
  return null;
}

/**
 * jscodeshift transformer
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.ImportDeclaration).forEach(path => {
    const imp = path.value;
    const specifier = imp.source.value;

    if (!specifier.startsWith('commons/')) return;

    const namedImports = (imp.specifiers || []).filter(s => s.type === 'ImportSpecifier');
    const grouped = {};

    namedImports.forEach(spec => {
      const name = spec.imported.name;
      const target = getTargetModule(name);
      if (!target) return;

      const { module, kind } = target;
      if (!grouped[module]) grouped[module] = { names: [], types: [] };
      if (kind === 'type') grouped[module].types.push(name);
      else grouped[module].names.push(name);

      // Remove from original import
      const index = imp.specifiers.indexOf(spec);
      if (index >= 0) imp.specifiers.splice(index, 1);
    });

    // Insert new imports per module
    Object.entries(grouped).forEach(([mod, { names, types }]) => {
      if (names.length > 0) {
        root.get().node.program.body.unshift(
          j.importDeclaration(
            names.map(n => j.importSpecifier(j.identifier(n))),
            j.literal(mod),
            'value' // value import
          )
        );
      }
      if (types.length > 0) {
        root.get().node.program.body.unshift(
          j.importDeclaration(
            types.map(n => j.importSpecifier(j.identifier(n))),
            j.literal(mod),
            'type' // type-only import
          )
        );
      }
    });

    // Remove original import if empty
    if ((imp.specifiers || []).length === 0 && !imp.default) j(path).remove();
  });

  return root.toSource({ quote: 'single', reuseWhitespace: true, trailingComma: false });
}

// CJS export
module.exports = transformer;
