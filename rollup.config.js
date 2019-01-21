// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import _ from 'lodash';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const main =  {
    input: 'src/db.js',
    // external: [ '@babel/runtime/helpers/defineProperty' ],
    output: {
        file: 'build/bundle.js',
        // format: 'esm',
        format: 'umd',
        sourcemap: true,
        name: 'StateDB'
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
            "build/bundle.js": "demos/vue/db.js",
            verbose: true
        })
    ]
}

const esm = _.cloneDeep(main);
esm.output.format = 'esm';
esm.output.file = 'build/bundle.esm.js';
esm.plugins[2] = copy({
    "build/bundle.esm.js": "demos/todo/src/common/db.js",
    verbose: true
})

const devtool =  {
    input: 'src/devTool/index.js',
    // external: [ '@babel/runtime/helpers/defineProperty' ],
    output: {
        file: 'build/devtool.bundle.js',
        // format: 'esm',
        format: 'umd',
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
            "build/devtool.bundle.js": "demos/vue/devtool.db.js",
            verbose: true
        })
    ]
}

const esmDevtool = _.cloneDeep(devtool);
esmDevtool.output.format = 'esm';
esmDevtool.output.file = 'build/devtool.bundle.esm.js';
esmDevtool.plugins[2] = copy({
    "build/devtool.bundle.esm.js": "demos/todo/src/common/devtool.db.js",
    verbose: true
})

export default [main, esm, devtool, esmDevtool];