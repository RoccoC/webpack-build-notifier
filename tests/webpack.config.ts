import WebpackBuildNotifierPlugin from '../src/index';
import webpack from 'webpack';
import path from 'path';
import { Config } from '../src/types';

const getFullPath = (p: string) => path.resolve(__dirname, p);

const getWebpackConfig = (
  pluginConfig?: Config,
  result: 'success' | 'warning' | 'error' | 'childWarning' = 'success',
  watch: boolean = false
): webpack.Configuration => ({
  watch,
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
      },
    ]
  },
  resolve: {
    extensions: ['.js']
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
