const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, 'app/public/javascript'),
  entry: {
    app: './app.js'
  },
  output: {
    path: path.resolve(__dirname, 'app/public/dist', 'assets'),
    filename: '[name].bundle.js',
    publicPath: '/assets',
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      // JS LOADER
      // Reference: https://github.com/babel/babel-loader
      // Transpile .js files using babel-loader
      // Compiles ES6 and ES7 into ES5 code
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'stage-3'],
      }, 
    }, {
      // ASSET LOADER
      // Reference: https://github.com/webpack/file-loader
      // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
      // Rename the file using the asset hash
      // Pass along the updated reference to your code
      // You can add here any file extension you want to get copied to your output
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'file-loader'
    }, {
      // HTML LOADER
      // Reference: https://github.com/webpack/raw-loader
      // Allow loading html through js
      test: /\.html$/,
      loader: 'raw'
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jquery: "jquery",
      "window.jQuery": "jquery",
      jQuery:"jquery"
    })
  ]
}