const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');

test('share menus use scale and fade transitions when opening', () => {
  assert.match(css, /\.share-menu\{[^}]*scale\(/);
  assert.match(css, /\.share-menu\.open\{[^}]*scale\(1\)/);
});

test('share pills lift on hover', () => {
  assert.match(css, /\.share-menu button:hover[^}]*transform:translateY\(-2px\)/);
});

test('toasts animate scale as they appear', () => {
  assert.match(css, /\.toast\{[^}]*scale\(/);
  assert.match(css, /\.toast\.show\{[^}]*scale\(1\)/);
});

test('share feedback keeps short transitions when reduced motion is enabled', () => {
  const reducedMotion = css.match(/@media \(prefers-reduced-motion: reduce\)\{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(reducedMotion, /\.share-menu,\.share-menu button,\.toast\{transition-duration:/);
});
