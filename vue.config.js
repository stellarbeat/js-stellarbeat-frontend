const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const webpack = require('webpack');

module.exports = {
    css: {
        extract: true,
        sourceMap: true
    },
    outputDir: !process.env.SSR ? "./dist-client" : "./dist-server",
    configureWebpack: {
        entry: !process.env.SSR ? './src/entry-client.ts' : './src/entry-server.ts',
        plugins: [
            // To strip all locales except “en”
            new MomentLocalesPlugin(),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'node_modules/stellar_analysis/stellar_analysis_bg.wasm',
                        to: 'worker/stellar_analysis_bg.wasm'
                    },
                ],
            }),
        ],
        optimization: {
            minimize: !process.env.SSR,
            splitChunks: !process.env.SSR ? {
                chunks: 'all',
                maxSize: 250000,
                minSize: 100000,
            } : false
        },
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
                    exclude: [/node_modules\/(?!bootstrap-vue\/src\/)/, /\.worker\.js$/],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env'],
                            compact: false
                        },
                    }
                },
                {
                    test: /\.js$/,
                    // Exclude transpiling `node_modules`, except `fbas-analysis`
                    exclude: /node_modules\/(?!stellar_analysis\/)/,
                    use: {
                        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
                    }
                }
            ]
        }
    },

    chainWebpack: config => {
        if (process.env.SSR) {
 //           config.devtool('source-map');
            config.target('node');
            config.output.libraryTarget('commonjs2');
            config.plugin("ssr-server").use(new VueSSRServerPlugin());
            config.plugins.delete('hmr');
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            config.plugins.delete('friendly-errors');
            config.plugins.delete('webpack-bundle-analyzer');
            config.plugin("limit-chunk-count-plugin").use(new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1//needed for mini css extract plugin to work server side
            }))
            config.externals(
                nodeExternals({
                    allowlist: /\.(css|vue)$/
                })
            );
        } else{
            config.plugin("ssr-client").use(new VueSSRClientPlugin({}));
        }
    },

    pluginOptions: {
        webpackBundleAnalyzer: {
            openAnalyzer: false
        }
    },

    runtimeCompiler: true
}