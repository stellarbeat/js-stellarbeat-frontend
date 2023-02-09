/* eslint-disable */
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  css: {
    extract: true,
    sourceMap: true,
  },
  outputDir: "./dist-client",
  configureWebpack: {
    entry: "./src/entry-client.ts",
    plugins: [
      // To strip all locales except “en”
      new MomentLocalesPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/@stellarbeat/stellar_analysis_web/stellar_analysis_bg.wasm",
            to: "js/stellar_analysis_bg.wasm",
          },
          {
            from: "*.json",
            to: "schemas/",
            context: "node_modules/@stellarbeat/js-stellarbeat-shared/schemas/",
          },
        ],
      })
    ],
    optimization: {
      minimize: true,
      splitChunks:
         {
            chunks: "all",
            maxSize: 250000,
            minSize: 100000,
          }
    },
    resolve: {
      alias: {
        // Alias for using source of BootstrapVue
        "bootstrap-vue$": "bootstrap-vue/src/index.js",
      },
      fallback: {
        stream: require.resolve("stream-browserify"),
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          // Exclude transpiling `node_modules`, except `bootstrap-vue/src`
          // exclude js workers
          //exclude generated js
          exclude: [
            /node_modules\/(?!bootstrap-vue\/src\/)/,
            /\.worker\.js$/,
            /generated\//,
          ],
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/env"],
              compact: false,
            },
          },
        },
        {
          test: /\.js$/,
          // Exclude transpiling `node_modules`, except `fbas-analysis`
          exclude: /node_modules\/(?!stellar_analysis\/)/,
          use: {
            loader: require.resolve("@open-wc/webpack-import-meta-loader"),
          },
        },
      ],
    },
  },

  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },

  runtimeCompiler: false,
};
