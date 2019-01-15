/**
 * @file: project.conf.js
 *
 * @author: xieyu03(xieyu03@baidu.com)
 *
 * @date: 2017-12-11 20:49:19
 *
 * @description:
 * 配置入口的 webpack 构建配置
 */
const path = require('path');
const commonDevServerConf = {
	contentBase: path.join(__dirname, '../dist'),
	compress: true,
	hotOnly: false,
	disableHostCheck: true,
	port: 9090,
	host: '0.0.0.0',
	open: true,
	hot: false,
	inline: true,
	watchContentBase: true,
	overlay: {
		warnings: false,
		errors: true
	},
	stats: {
		colors: true,
		cached: true,
		modules: true,
		children: false,
		chunks: false,
		chunkModules: false,
		performance: true
	},

	proxy: {
		// '/user/*': {
		// 	target: 'http://10.2.101.12:8090'
		// },
		// '/open/*': {
		// 	target: 'http://10.2.101.12:8090'
		// },
		// onProxyRes: function(proxyRes, req, res) {
		//     var cookies = proxyRes.headers['set-cookie'];
		//     var cookieRegex = /Path=\/10.2.101.12\//i;
		//     //修改cookie Path
		//     if (cookies) {
		//         var newCookie = cookies.map(function(cookie) {
		//             if (cookieRegex.test(cookie)) {
		//                 return cookie.replace(cookieRegex, 'Path=/');
		//             }
		//             return cookie;
		//         });
		//         //修改cookie path
		//         delete proxyRes.headers['set-cookie'];
		//         proxyRes.headers['set-cookie'] = newCookie;
		//     }
		// }
	}
	// proxy: [
	    // {
	//         context: ['/user/*', '/open/*'],
	        // target: 'http://10.2.101.22:8090'
	//     }
	// ]
};

const vendorConf = [ 'react', 'react-dom', 'react-router-dom', 'mobx', 'mobx-react', 'axios' ];

module.exports = function(port = 8222) {
	const conf = {
		entry: './src/index.js',
		template: {
			dev: './templates/index.dev.html',
			rd: './templates/index.online.html',
			qa: './templates/index.online.html',
			online: './templates/index.online.html'
		},
		vendors: vendorConf,
		devServer: Object.assign(commonDevServerConf, { port: port })
	};
	return conf;
};
