let webpack = require('webpack');
let path = require('path');
let StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
let Visualizer = require('webpack-visualizer-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let ReactIntlPlugin = require('react-intl-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

let webpackConfig = {
    mode: 'production',
    name: 'main',
    resolve: {
        extensions: ['.js'],
        alias: {
            react: path.resolve('./node_modules/react'),
        }
    },
    entry: {
        main: [
            './client.js'
        ],
        vendor: [
            'react-intl', 'react', 'react-dom', 'semantic-ui-react', 'react-hotkeys', 'react-list', 'react-responsive', 'react-custom-scrollbars', 'react-resize-aware', 'async', 'immutable', 'classnames', 'fluxible', 'fluxible-addons-react', 'fluxible-plugin-fetchr', 'fluxible-router', 'react-google-recaptcha', 'iso-639-1', 'lodash', 'cheerio', 'react-dnd', 'react-dnd-html5-backend', 'striptags', 'js-sha512', 'debug', 'md5', 'js-cookie', 'cookie', 'fumble', 'crypt'
        ]
    },
    output: {
        path: path.resolve('./build/js'),
        publicPath: '/public/js/',
        filename: '[name].js'
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            minChunks: Infinity,
            filename: '[name].bundle.js',
            chunks: 'all'
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            // Getting URLs for font files otherwise we get encoding errors in css-loader
            { test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/, loader: 'file-loader'},// 'url-loader?limit=100000'},
            {
                test: /\.css$/,
                exclude:  /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '/public/css/'
                        },
                    }, 
                    'css-loader?modules&importLoaders=1&localIdentName=[hash:base64:5]'
                ]
                /*loader: MiniCssExtractPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader?modules&importLoaders=1&localIdentName=[hash:base64:5]'
                    ],
                    // use: 'css-loader',
                    // options: {importLoaders: 1, modules: true},
                    publicPath: '/public/css/'
                })*/
            },
            // { test: /\.css$/,
            //     use: [
            //         {
            //             loader: 'style-loader'
            //         },
            //         {
            //             loader: 'css-loader'
            //         }
            //     ]
            // },

        ]
    },
    node: {
        setImmediate: false
    },
    plugins: [
        //collect all messages into one json
        //new ReactIntlPlugin(),
        // css files from the extract-text-plugin loader
        new MiniCssExtractPlugin({
            filename: '../css/vendor.bundle.css',
            disable: false,
            allChunks: true
        }),

        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                // Mainly used to require CSS files with webpack, which can happen only on browser
                // Used as `if (process.env.BROWSER)...`
                BROWSER: JSON.stringify(true),
            }
        }),
        new UglifyJSPlugin({
            sourceMap: true,
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            }
        }),
        // Write out stats file to build directory.
        new StatsWriterPlugin({
            filename: 'webpack.stats.json', // Default
            fields: null,
            transform: function (data) {
                return JSON.stringify(data, null, 2);
            }
        }),
        new Visualizer()
    ],
    devtool: 'source-map',

    // we do not include the javascript files that include ENV variables
    // this way we can build the bundle, but also be able to read the ENV during runtime, not build-time
    // these excluded files are in a separate bundle using `prod.settings.config.js` file
    externals: [
        (context, request, callback) => {
            if (/\/configs\/(microservices|secrets|general|settings)/.test(request)) {
                return callback(null, 'SlideWikiSettings');
            }
            callback();
        },
    ],

};

module.exports = [webpackConfig, require('./prod.settings.config')];
