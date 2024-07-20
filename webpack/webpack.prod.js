const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    devtool: 'source-map',
    mode: 'production',
    plugins: [
    ],
});
