// vue.config.js
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
module.exports = {
	configureWebpack: () => ({
		resolve: {
			alias: {
				'@utils': path.resolve('./src/modules/utils'),
				'@mixin': path.resolve('./src/mixin/'),
				'@comp': path.resolve('./src/components/'),
				'@api': path.resolve('./src/api/')
			}
		}
	}),
	chainWebpack: config => {
		// set svg-sprite-loader
		config.module
		.rule('svg')
		.exclude.add(path.resolve('./src/assets/svg'))
		.end();
		config.module
		.rule('assets')
		.test(/\.svg$/)
		.include.add(path.resolve('./src/assets/svg'))
		.end()
		.use('svg-sprite-loader')
		.loader('svg-sprite-loader')
		.options({
			symbolId: 'icon-[name]'
		})
		.end();
		// 这里是对环境的配置，不同环境对应不同的BASE_URL，以便axios的请求地址不同
		config.plugin('define').tap(args => {
			args[0]['process.env'].BASE_URL = JSON.stringify(process.env.BASE_URL);
			args[0]['process.env'].API_KEY = JSON.stringify(process.env.API_KEY);
			return args;
		});
		if (process.env.NODE_ENV === 'production') {
			// #region 启用GZip压缩
			config
			.plugin('compression')
			.use(CompressionPlugin, {
				asset: '[path].gz[query]',
				algorithm: 'gzip',
				test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
				threshold: 10240,
				minRatio: 0.8,
				cache: true
			})
			.tap(args => {});

			// #endregion

			// #region 忽略生成环境打包的文件

			var externals = {
				'vue': 'Vue',
				'axios': 'axios',
				'element-ui': 'ELEMENT',
				'vue-router': 'VueRouter',
				'vuex': 'Vuex'
			};
			config.externals(externals);
			const cdn = {
				css: [
					// element-ui css
					'//unpkg.com/element-ui/lib/theme-chalk/index.css',
					'//cdn.jsdelivr.net/npm/assembly-css/dist/assembly-css.min.css'
				],
				js: [
					// vue
					'//cdn.staticfile.org/vue/2.6.10/vue.min.js',
					// vue-router
					'//cdn.staticfile.org/vue-router/3.0.3/vue-router.min.js',
					// vuex
					'//cdn.staticfile.org/vuex/3.1.0/vuex.min.js',
					// axios
					'//cdn.staticfile.org/axios/0.19.0-beta.1/axios.min.js',
					// element-ui js
					'//unpkg.com/element-ui/lib/index.js'
				]
			};
			config.plugin('html')
			.tap(args => {
				args[0].cdn = cdn;
				return args;
			});

			// #endregion
		}
	},
	devServer: {
		proxy: {
			'^/web/': {
				target: 'http://project.hzsunong.cn/api/v3/',
				ws: false,
				pathRewrite: {
					'^/web': '/'
				}
			}
		}
	}
};