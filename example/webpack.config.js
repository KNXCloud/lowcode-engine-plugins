const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 */
const configuration = {
  mode: 'development',
  entry: './src/editor.tsx',
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    client: {
      overlay: false,
    },
  },
  resolve: {
    extensions: ['.js', '.mjs', '.ts', '.tsx'],
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.(png|jpg|webp|jpeg|gif|svg)$/i,
        type: 'asset',
      },
    ],
  },
  externals: {
    vue: 'var window.Vue',
    lodash: 'var window._',
    moment: 'var window.moment',
    react: 'var window.React',
    'react-dom': 'var window.ReactDOM',
    'prop-types': 'var window.PropTypes',
    '@alifd/next': 'var window.Next',
    '@alilc/lowcode-engine': 'var window.AliLowCodeEngine',
    '@alilc/lowcode-engine-ext': 'var window.AliLowCodeEngineExt',
    '@alilc/lowcode-editor-core': 'var window.AliLowCodeEngine.common.editorCabin',
    '@alilc/lowcode-designer': 'var window.AliLowCodeEngine.common.designerCabin',
    '@alilc/lowcode-editor-skeleton': 'var window.AliLowCodeEngine.common.skeletonCabin',
    '@knxcloud/lowcode-vue-renderer': 'var window.LCVueRenderer',
    '@knxcloud/lowcode-vue-simulator-renderer': 'var window.LCVueSimulatorRenderer',
  },
};

module.exports = configuration;
