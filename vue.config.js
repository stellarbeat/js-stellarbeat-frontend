const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const nodeExternals = require('webpack-node-externals');

if (!process.env.SSR) {
    module.exports = {
        configureWebpack: {
            entry: './src/entry-client.ts',
            output: {
                path: path.resolve(__dirname, './dist'),
                filename: 'build.js'
            },
            plugins: [
                // To strip all locales except “en”
                new MomentLocalesPlugin(),
                new CopyPlugin({
                    patterns: [
                        {
                            from: 'node_modules/stellar_analysis/stellar_analysis_bg.wasm',
                            to: 'dist/stellar_analysis_bg.wasm'
                        },
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
                        exclude: /node_modules\/(?!stellar_analysis\/)/,
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
} else { //for the server we need to compile to nodejs compatible code @todo: cleanup
    module.exports = {
        configureWebpack: {
            entry: './src/main.ts',
            output: {
                path: path.resolve(__dirname, './dist'),
                filename: 'build-server.js'
            },
            plugins: [
                // To strip all locales except “en”
                new MomentLocalesPlugin(),
                new CopyPlugin({
                    patterns: [
                        {
                            from: 'node_modules/stellar_analysis/stellar_analysis_bg.wasm',
                            to: 'dist/stellar_analysis_bg.wasm'
                        },
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
            config.target = 'node';
            config.output.libraryTarget = 'commonjs2';
            config.plugin("manifest").use(new ManifestPlugin({
                filename: 'ssr-manifest'
            }));
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
        }
    }
}