import buble from '@rollup/plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
    input: "demo.js",
    output: {
        banner: "",
        format: "umd",
        file: "ace.js",
        name: "ace"
    },
    plugins: [
        // buble({namedFunctionExpressions: false}),
        json(),
        nodeResolve({
            jsnext: true,
            main: true
        }),

        commonjs({
            // non-CommonJS modules will be ignored, but you can also
            // specifically include/exclude files
            include: '**',  // Default: undefined
            exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
            // these values can also be regular expressions
            // include: /node_modules/

            // search for files other than .js files (must already
            // be transpiled by a previous plugin!)
            extensions: [ '.js', '.ts'],  // Default: [ '.js' ]

            // if true then uses of `global` won't be dealt with by this plugin
            ignoreGlobal: false,  // Default: false

            // if false then skip sourceMap generation for CommonJS modules
            sourceMap: false,  // Default: true

            // explicitly specify unresolvable named exports
            // (see below for more details)
            namedExports: { 'react': ['createElement', 'Component' ] },  // Default: undefined

            // sometimes you have to leave require statements
            // unconverted. Pass an array containing the IDs
            // or a `id => boolean` function. Only use this
            // option if you know what you're doing!
            ignore: [ 'conditional-runtime-dependency' ]
        })
    ]
};
