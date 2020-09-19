const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    configureWebpack: {
        optimization: {
            splitChunks: {
                chunks: 'all'
            }
        },
        plugins: [
            // To strip all locales except “en”
            new MomentLocalesPlugin(),
            new CopyPlugin({
                patterns: [
                    {from: 'node_modules/@stellarbeat/stellar_analysis_temp/stellar_analysis_bg.wasm', to: 'dist/stellar_analysis_bg.wasm'},
                ],
            }),
        ],
        resolve: {
            alias: {
                // Alias for using source of BootstrapVue
                'bootstrap-vue$': 'bootstrap-vue/src/index.js'
            }
        },
        module: {
            rules: [
                {
                    test: /\.worker\.js$/,
                    use: {loader: 'worker-loader'}
                },
                {
                    test: /\.js$/,
                    // Exclude transpiling `node_modules`, except `bootstrap-vue/src`
                    exclude: /node_modules\/(?!bootstrap-vue\/src\/)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env']
                        }
                    }
                },
                {
                    test: /\.js$/,
                    // Exclude transpiling `node_modules`, except `fbas-analysis`
                    exclude: /node_modules\/(?!@stellarbeat\/stellar_analysis_temp\/)/,
                    use: {
                        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
                    }
                }
            ]
        }
    },
    chainWebpack: config => {
        config.module.rule('js').exclude.add(/\.worker\.js$/)
    },
    pluginOptions: {
        webpackBundleAnalyzer: {
            openAnalyzer: false
        }
    }
}