const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('@babel/polyfill')

module.exports = {
  entry: ['@babel/polyfill' ,path.resolve(__dirname, './src/index.js')]
  , node: {
    fs: 'empty'
  },
  
module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader','eslint-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']

  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  }, devtool: 'source-map',
  plugins: [
    
    new HtmlWebpackPlugin(
      { template: './src/index.html'}
    )
  ],
  externals: [
    (function () {
      var IGNORES = [
        'electron'
        // 'fs'
      ]
      return (context, request, callback) => {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')")
        }
        return callback()
      }
    })()
  ]
}