const webpack = require('webpack');
const webpackRunner = require('./webpack-runner.js');
const dllRunner = require('./webpack-dll-runner.js');
const projectConf = require('./project.conf.js');

// const env = 'dev';
// const project = 'mobile';

let env = process.argv[2] || 'dev';
let port = process.argv[3] || '8000';

let projectC = projectConf(port);

if (projectC.vendors) {
    dllRunner(projectC.vendors, env);
}
webpackRunner(env, port);
