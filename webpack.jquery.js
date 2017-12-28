const path = require('path')
const webpack = require('webpack')

module.exports = [{
  entry: './src/vala.jquery.js',
  output: {
    filename: 'vala.jquery.js',
    path: path.resolve(__dirname, './dist')
  },
},{
  entry: './src/vala.jquery.js',
  output: {
    filename: 'vala.jquery.min.js',
    path: path.resolve(__dirname, './dist')
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({})
  ]
}]
