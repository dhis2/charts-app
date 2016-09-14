var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: {
        'app': './src/index.js',
        'chart': './src/plugin.js',
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: '[name].js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /d2-analysis/, /d2-charts-api/, /scripts/],
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-2'],
                },
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'url?limit=8192',
                    'img'
                ]
            },
        ],
    }
};
