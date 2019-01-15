// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';

const devtool =  {
    input: 'src/devTool/index.js',
    // external: [ '@babel/runtime/helpers/defineProperty' ],
    output: {
        file: 'build/devtool.bundle.js',
        format: 'esm',
        // format: 'umd',
        sourcemap: true,
        name: 'devtool'
    },
    plugins: [
        // resolve(), // tells Rollup how to find date-fns in node_modules
        // commonjs(), // converts date-fns to ES modules
        babel({
          exclude: 'node_modules/**',
          runtimeHelpers: true,
          // externalHelpers: true,
        }),
        production && uglify(), // minify, but only in production
        copy({
            "build/devtool.bundle.js": "demos/todo/src/common/devtool.db.js",
            verbose: true
        })
    ]
}