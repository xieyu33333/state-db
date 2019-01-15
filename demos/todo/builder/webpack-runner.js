/**
 * @file: webpack-runner.js
 *
 * @author: xieyu(xieyu@zhidaoauto.com)
 *
 * @date: 2018-11-06 21:00:16
 *
 * @description:
 */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const projectConf = require('./project.conf.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const loaderResolve = require('./loader-resolve');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({size: 4});
// const PurifyCSSPlugin = require('purifycss-webpack');
// const glob = require('glob-all');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const waitSign = Array(30)
    .fill('*')
    .join('');

const generateWebpackConf = (env = 'dev', port) => {
    let pConf = projectConf(port);
    let confs = {};
    let hashType = env === 'dev' ? '[hash]' : '[chunkhash]';

    let commonConf = {
        output: {
            path: path.join(__dirname, '../dist', env),
            filename: `[name].bundle.js`,
            publicPath: '/'
        },

        module: {
            rules: loaderResolve(env)
        },

        resolve: {
            alias: {
                '@images': path.resolve('src/common/images'),
                '@utils': path.resolve('src/common/utils'),
                '@style': path.resolve('src/common/style'),
                '@components': path.resolve('src/common/components'),
                '@conf': path.resolve('src/common/conf')
            }
        }
    };
    let defineObj = {
        __DEV__: false,
        __ONLINE__: false,
        __RD__: false,
        __QA__: false,
        'process.env.NODE_ENV': env === 'dev' ? '"development"' : '"production"'
    };

    defineObj['__' + env.toUpperCase() + '__'] = true;

    /**
     * 开发环境
     */
    confs.dev = {
        entry: pConf.entry,
        watch: true,
        mode: 'development',
        output: commonConf.output,
        devtool: 'inline-source-map',
        devServer: pConf.devServer,
        cache: true,
        module: commonConf.module,
        resolve: commonConf.resolve,

        plugins: [
            new webpack.DefinePlugin(defineObj),

            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css'
            }),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./manifest.json'),
                name: 'vendors'
            }),
            new HtmlWebpackPlugin({
                template: pConf.template[env],
                filename: './index.' + env + '.html',
                version: new Date().getTime()
            }),
            new HappyPack({
                id: 'js',
                // cache: true,
                verbose: false,
                threadPool: happyThreadPool,
                loaders: [
                    {
                        loader: 'babel-loader',
                        query: {
                            cacheDirectory: true,
                            plugins: [
                                // ['import', {libraryName: 'antd', libraryDirectory: 'lib', style: false}, 'antd'],
                                // [
                                //     'import',
                                //     {libraryName: 'ant-design-pro', libraryDirectory: 'lib', style: false},
                                //     'ant-design-pro'
                                // ]
                            ]
                        }
                    }
                ]
            })
            // new webpack.HotModuleReplacementPlugin()
            // new BundleAnalyzerPlugin()
        ]
    };
    /**
     * 生产环境
     */
    confs.online = {
        entry: pConf.entry,
        output: commonConf.output,
        devtool: false,
        cache: false,
        mode: 'production',
        // devServer: pConf.devServer,
        module: commonConf.module,
        resolve: commonConf.resolve,
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new HtmlWebpackPlugin({
                template: pConf.template[env],
                filename: './index.html',
                version: new Date().getTime(),
                inject: false,
                minify: true
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css'
            }),
            //本项目暂时不用，比较试用于没引第三方组件库的情况
            // new PurifyCSSPlugin({
            //     minimize: true,
            //     purifyOptions: {
            //         rejected: true
            //     },
            //     paths: glob.sync([
            //         // path.join(__dirname, '../src/*.html'),
            //         path.join(__dirname, '../src/**'),
            //     ]),
            // }),
            new webpack.DefinePlugin(defineObj),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./manifest.json'),
                name: 'vendors'
            }),
            new CleanWebpackPlugin(path.join(__dirname, '../dist', env), {
                root: path.join(__dirname, '../')
            }),

            new UglifyJSPlugin({
                parallel: 2
            }),
            new HappyPack({
                id: 'js',
                verbose: false,
                threadPool: happyThreadPool,
                loaders: [
                    {
                        loader: 'babel-loader',
                        query: {
                            cacheDirectory: false,
                            plugins: [
                                ['import', {libraryName: 'antd', libraryDirectory: 'lib', style: false}, 'antd'],
                                [
                                    'import',
                                    {libraryName: 'ant-design-pro', libraryDirectory: 'lib', style: false},
                                    'ant-design-pro'
                                ]
                            ]
                        }
                    }
                ]
            }),
            // new BundleAnalyzerPlugin()
        ]
    };

    confs.rd = Object.assign({}, confs.online);
    confs.qa = Object.assign({}, confs.online);

    return confs[env];
};

const runner = function(env, port) {
    let conf = generateWebpackConf(env, port);
    env === 'dev' && WebpackDevServer.addDevServerEntrypoints(conf, conf.devServer);
    let compiler = webpack(conf);

    let compilerCallback = function(err, stats) {
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
            console.log('  Build failed with errors.\n');
            process.exit(1);
        }

        console.log('  Build complete.\n');
        console.log(
            '  Tip: built files are meant to be served over an HTTP server.\n' +
                "  Opening index.html over file:// won't work.\n"
        );
    };
    if (conf.devServer) {
        let serverConf = conf.devServer;
        let host = serverConf.host || 'localhost';
        let usePort = port || serverConf.port || 8008;
        let server = new WebpackDevServer(compiler, serverConf);
        server.listen(usePort, host, function() {
            console.log(waitSign + ' server on port ' + usePort + ' ' + waitSign);
        });
    } else {
        compiler.run(compilerCallback);
    }
};

module.exports = runner;
