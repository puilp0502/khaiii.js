const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "khaiii.js",
    chunkLoading: false,
    wasmLoading: false,
    libraryTarget: "umd",
    globalObject: "this",
    library: "Khaiii",
  },
  resolve: {
    alias: {
      libkhaiii: path.resolve(__dirname, "bin/libkhaiii"),
    },
    extensions: [".js", ".ts"],
  },
  module: {
    noParse: /bin\/libkhaiii.js$/,
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: ["babel-loader", "ts-loader"],
      },
    ],
  },
  node: {
    __dirname: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "bin/libkhaiii.wasm" }, // dest defaults to compiler.options.output
        { from: "bin/resources/", to: "resources/"}
      ],
    }),
  ],
};
