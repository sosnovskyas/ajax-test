export default {
  watch: true,
  devtool: 'cheap-module-inline-source-map',

  output: {
    publicPath: '/assets/'
  },

  module: [{
    loaders:[{
      test:/\.js$/,
      exclude: /node_modules/,
      loaders:['babel']
    }]
  }]
}
