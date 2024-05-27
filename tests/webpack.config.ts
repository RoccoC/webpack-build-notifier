import path from 'path';
import webpack from 'webpack';
import WebpackBuildNotifierPlugin from '../src/index';
import { Config } from '../src/types';

const getFullPath = (p: string) => path.resolve(__dirname, p);

const getWebpackConfig = (
  pluginConfig?: Config,
  result: 'success' | 'warning' | 'error' | 'childWarning' = 'success',
  watch: boolean = false,
): webpack.Configuration => ({
  watch,
  entry: getFullPath(`${result}.js`),
  output: {
    path: getFullPath('assets'),
    publicPath: '/',
    filename: `${result}.bundle.js`,
    module: true,
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
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
    }),
  ],
  experiments: {
    outputModule: true, // This enables ESM output
  },
});

export default getWebpackConfig;
