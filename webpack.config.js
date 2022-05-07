import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

export default {
  entry: './src/index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/assets/favicon.ico'
    }),
    new webpack.DefinePlugin({
      DEVELOP: JSON.stringify(true)
    })
  ],
  module: {
    rules: [
      {
        test: /\.(ogg|png)$/,
        type: 'asset/resource'
      }
    ]
  },
  devServer: {
    host: '0.0.0.0',
    port: 5500
  }
}
