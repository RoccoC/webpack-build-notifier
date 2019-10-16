import WebpackBuildNotifierPlugin from '../index';
import webpack from 'webpack';
import path from 'path';

const getFullPath = (p) => path.resolve(__dirname, p);

const getWebpackConfig = (
  pluginConfig = {},
  result = 'success',
  watch = false
) => ({
  watch: !!watch,
  entry: getFullPath(`${result}.js`),
  output: {
    path: getFullPath('assets'),
    publicPath: '/',
    filename: `${result}.bundle.js`
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: result === 'warning' ? 100 : undefined,
  },
  plugins: [
    new WebpackBuildNotifierPlugin({
      ...pluginConfig,
      title: 'Build Notification Test',
      suppressCompileStart: false,
    })
  ]
});

export default getWebpackConfig;