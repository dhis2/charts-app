var webpack = require('webpack');
var webpackBaseConfig = require('./webpack-base-config');

webpackBaseConfig.devServer = {
    port: 8081,
    inline: true,

    // delay build a bit to avoid errors when
    // dependencies files are not built yet
    watchOptions: {
        aggregateTimeout: 1000
    }
};

module.exports = webpackBaseConfig;
