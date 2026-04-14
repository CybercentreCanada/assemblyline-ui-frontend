/* eslint-env node */

module.exports.parser = 'tsx';

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let didChange = false;

  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;

    if (source === 'react-router-dom') {
      path.node.source.value = 'react-router';
      didChange = true;
    }
  });

  return didChange
    ? root.toSource({
        quote: 'single',
        reuseWhitespace: true
      })
    : null;
};
