import WebpackBuildNotifierPlugin from '../src/index';
import webpack from 'webpack';
import path from 'path';

const getFullPath = (p: string) => path.resolve(__dirname, p);

const config: webpack.Configuration = {
  entry: getFullPath('sample.js'),
  output: {
    path: getFullPath('assets'),
    publicPath: '/',
    filename: 'success.bundle.js'
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
  plugins: [
    new WebpackBuildNotifierPlugin({
      title: 'Build Notification',
      suppressCompileStart: false,
    })
  ]
};

export default config;
