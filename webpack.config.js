import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'

export default ({ develop = false }) => ({
  entry: './src/index.js',
  mode: develop ? 'development' : 'production',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/assets/favicon.ico'
    }),
    new webpack.DefinePlugin({
      DEVELOP: JSON.stringify(develop)
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
})
