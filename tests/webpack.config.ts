import WebpackBuildNotifierPlugin from '../src/index';
import webpack from 'webpack';
import path from 'path';
import { Config } from '../src/types';

const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');

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
      {
        test: /\.css$/,
        use: [
            ExtractCssChunksPlugin.loader,
            'css-loader',
            { loader: 'postcss-loader', options: { plugins: [ require('autoprefixer') ] } }
        ],
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
    new ExtractCssChunksPlugin(),
    new WebpackBuildNotifierPlugin({
      ...pluginConfig,
      title: 'Build Notification Test',
      suppressCompileStart: false,
    })
  ]
});

export default getWebpackConfig;
