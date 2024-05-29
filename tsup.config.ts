import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  esbuildOptions: (options, { format }) => {
    if (format === 'cjs') {
      // eslint-disable-next-line no-param-reassign
      options.footer = {
        // workaround for CJS default export
        // @see https://github.com/evanw/esbuild/issues/1182#issuecomment-1011414271
        // and https://github.com/u3u/fix-tsup-cjs
        js: 'module.exports = module.exports.default;',
      };
    }
  },
});
