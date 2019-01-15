/**
 * @file: webpack-dll-runner.js
 *
 * @author: xieyu(xieyu@zhidaoauto.com)
 *
 * @date: 2018-11-07 20:51:43
 *
 * @description:
 *  webpack 的dll 构建配置
 */
const webpack = require('webpack');
const path = require('path');

/**
 * dll 配置
 *
 * @param {Array} vendors 第三方库配置
 *
 * @param {string} env 环境标志
 *
 * @example:
 *
 * project: mobile/sidebar/desktop,
 * env: dev/rd/qa/dest
 */
module.exports = function(vendors = [], env) {
    // let outputPrefix = vendors instanceof Array ? project : '[name]';
    let entryOpts = vendors instanceof Array ? {vendors} : vendors;
    let dllPrefix = vendors instanceof Array ? '' : '[name]';

    const options = {
        output: {
            path: path.join(__dirname, '../dist/' + env),
            filename: 'vendors.js',
            library: 'vendors'
        },
        entry: entryOpts,
        plugins: [
            new webpack.DllPlugin({
                path: 'builder/manifest.json' || ['builder/', [dllPrefix, 'manifest.json'].join('-')].join(''),
                name: 'vendors' || [dllPrefix, 'vendors'].join('-'),
                context: __dirname
            })
        ],
        resolve: {
            alias: {}
        },
        optimization: {
            minimize: false
        },
        mode: 'development'
    };

    if (env !== 'dev') {
        options.optimization.minimize = true;
        options.mode = 'production';
    }

    // webpack(webpackConf).run(function(err, stats) {
    webpack(options, function(err, stats) {
        // spinner.stop()
        if (err) {
            throw err;
        }

        process.stdout.write(
            stats.toString({
                // context: path.join(__dirname, '../lib'),
                colors: true,
                cached: false,
                modules: true,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n'
        );

        if (stats.hasErrors()) {
            console.log('  Build Dll failed with errors.\n');
            process.exit(1);
        }

        console.log('Build Dll complete.\n');
    });
};
