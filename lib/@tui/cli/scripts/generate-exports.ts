#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function readDtsExports(dtsPath: string): string[] {
  const program = ts.createProgram([dtsPath], { allowJs: false });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(dtsPath);
  if (!sourceFile) throw new Error(`Cannot read ${dtsPath}`);

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) throw new Error(`Cannot get module symbol for ${dtsPath}`);

  return checker.getExportsOfModule(moduleSymbol).map(s => s.getName());
}

async function readJsExports(jsPath: string): Promise<string[]> {
  if (!fs.existsSync(jsPath)) return [];
  const jsModule = await import(pathToFileURL(jsPath).href);
  return Object.keys(jsModule);
}

function pathToFileURL(filePath: string): URL {
  return new URL(`file://${path.resolve(filePath)}`);
}

// --------------------------------------------------
// Main generator
// --------------------------------------------------
async function generateMergedExports(outFile: string, packages: string[]) {
  const merged: Record<string, Record<string, 'type' | 'value'>> = {};

  for (const pkgDir of packages) {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
    const moduleName = pkgJson.name;

    const dtsPath = pkgJson.types ? path.join(pkgDir, pkgJson.types) : path.join(pkgDir, 'dist/index.d.ts');
    const jsPath = path.join(pkgDir, 'dist/index.js');

    const dtsExports = await readDtsExports(dtsPath);
    const jsExports = await readJsExports(jsPath);

    const exportsMap: Record<string, 'type' | 'value'> = {};
    for (const name of dtsExports) {
      exportsMap[name] = jsExports.includes(name) ? 'value' : 'type';
    }

    merged[moduleName] = exportsMap;
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(merged, null, 2) + '\n');

  console.log(`✅ Merged exports written to ${outFile}`);
}

// --------------------------------------------------
// CLI
// --------------------------------------------------
async function main() {
  const [outFile, ...packages] = process.argv.slice(2);
  if (!outFile || packages.length === 0) throw new Error('Usage: generate-exports <out-file> <package-dir> [...]');
  await generateMergedExports(
    path.resolve(outFile),
    packages.map(p => path.resolve(p))
  );
}

main();
