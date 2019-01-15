/**
 * @file loader-resolve 解决不同env下loader区别问题 主要解决dev模式ExtractTextPlugin不热刷新样式问题
 * @author liangdong06
 */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const fixFlexbugs = require('postcss-flexbugs-fixes');
const cssnano = require('cssnano');

module.exports = function(env) {
    let commonLoader = [
        {
            test: /\.js$/,
            // exclude: path.resolve(__dirname, '../node_modules'),
            include: [
                path.resolve(__dirname, '../src'),
                path.resolve(__dirname, '../node_modules/intersection-observer-polyfill')
            ],
            use: ['happypack/loader?id=js']
        },
        {
            test: /\.(jpe?g|png|gif)$/,
            loader: 'url-loader',
            // exclude: [path.resolve(__dirname, '../src/view/common/imgs/emotion')],
            options: {
                limit: 4000,
                publicPath: './',
                name: 'images/[name].[ext]'
            }
        },
        {
            test: /\.(png|jpg|gif|jpeg)$/,
            include: [path.resolve(__dirname, '../src/view/common/imgs/emotion')],
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        publicPath: '../',
                        name: 'images/emotion/[name].[ext]'
                    }
                }
            ]
        },
        {
            test: /\.woff(\?.+)?$/,
            loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        },
        {
            test: /\.woff2(\?.+)?$/,
            loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        },
        {
            test: /\.ttf(\?.+)?$/,
            loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
        },
        {
            test: /\.eot(\?.+)?$/,
            loader: 'file-loader'
        },
        {
            test: /\.svg(\?.+)?$/,
            loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
        }
    ];
    let cssloader = {
        loader: 'css-loader',
        options: {
            minimize: true,
            sourceMap: env === 'dev'
        }
    };
    let lessLoader = ['less-loader'];
    let cssLoaders = [];

    /**
     * 非开发环境下的lessLoader
     */
    if (env !== 'dev') {
        let postloader = {
            loader: 'postcss-loader',
            options: {
                ident: 'postcss', // ident:识别
                plugins: loader => [
                    autoprefixer({
                        browsers: ['> 1% in CN', 'ie >= 8'],
                        remove: false
                    }),
                    fixFlexbugs(),
                    cssnano()
                    // require('postcss-import')({ root: loader.resourcePath }),
                    // require('postcss-cssnext')(),
                ]
            }
        };
        let extractLoader = {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: '../'
            }
        };

        lessLoader.unshift(postloader);
        lessLoader.unshift(cssloader);
        lessLoader.unshift(extractLoader);

        cssLoaders = [
            {
                test: /\.css$/,
                use: [extractLoader, 'css-loader', postloader]
            },
            {
                test: /\.less$/,
                use: lessLoader
            }
        ];
    } else {
        lessLoader.unshift(cssloader);
        lessLoader.unshift('style-loader');
        cssLoaders = [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: lessLoader
            }
        ];
    }
    return commonLoader.concat(cssLoaders);
};
