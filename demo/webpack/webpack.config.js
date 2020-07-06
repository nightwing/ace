"use strict";

module.exports = {
    mode: "development",
    entry: {
        demo: __dirname + '/demo.js',
       //  react: './demo-react.tsx',
    },
    module: {
        rules: [{
            test: /\.(t|j)sx?$/,
            use: {
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            },
            // exclude: /node_modules/,
        }],
    },
    resolveLoader: {
        modules: [
            "node_modules", 
            __dirname + "/node_modules",
        ],
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
        alias: {
            [require.resolve("eslint-plugin-react/lib/util/version.js")]: __dirname + "/mock/version.js"
        }
    },
    /*node: {
        global: false,
        process: false,
        Buffer: false,
        fs: false,
        __filename: "mock",
        __dirname: "mock",
        setImmediate: false
    },*/
    output: {
        filename: 'bundle.[name].js',
        path: __dirname + '/dist',
    },
    devServer: {
        contentBase: __dirname,
        compress: true,
        port: 9009
    },
};