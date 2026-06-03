const { merge } = require('webpack-merge');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const packageJson = require('../package.json');
const commonConfig = require('./webpack.common');

const devConfig = {
  mode: 'development',
  devServer: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
    historyApiFallback: {
      index: 'index.html',
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'marketing',
      filename: 'remoteEntry.js',
      exposes: {
        './MarketingApp': './src/bootstrap',
      },
      shared: packageJson.dependencies,
    }),
    new htmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
