const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = {
    css: {
        extract: !process.env.SSR, //causes async routes to fail in SSR
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
            })
        ],
        optimization: {
            splitChunks:
                false,
            minimize: false
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
                    exclude: /node_modules\/(?!bootstrap-vue\/src\/)/,
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
        config.module.rule('js').exclude.add(/\.worker\.js$/);
        config.plugins.delete('pre-render');
        if (process.env.SSR) {
            config.devtool('source-map');
            config.target('node');
            config.output.libraryTarget('commonjs2');
            config.plugin("ssr-server").use(new VueSSRServerPlugin());
            config.plugins.delete('hmr');
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            config.plugins.delete('friendly-errors');
            config.plugins.delete('webpack-bundle-analyzer');
            config.plugins.delete('pre-render');

            config.externals(
                nodeExternals({
                    allowlist: /\.(css|vue)$/
                })
            );
            config.optimization.splitChunks(false).minimize(false);
        } else{
            config.plugin("ssr-client").use(new VueSSRClientPlugin({}));
            config.optimization.splitChunks(false).minimize(false);
        }
    },
    pluginOptions: {
        webpackBundleAnalyzer: {
            openAnalyzer: false
        }
    }
}