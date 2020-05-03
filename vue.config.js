const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
    configureWebpack: {
        optimization: {
            splitChunks: {
                chunks: 'all'
            }
        },
        plugins: [
            // To strip all locales except “en”
            new MomentLocalesPlugin()
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