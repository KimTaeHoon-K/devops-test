const path = require('path');
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig(() => {
  return {
    publicPath: process.env.PUBLIC_PATH,
    transpileDependencies: true,
    lintOnSave: false,
    pages: {
      index: {
        entry: './src/main.ts',
      },
    },
    devServer: {
      host: '0.0.0.0',
      port: process.env.PORT,
      allowedHosts: 'all',
      // 모듈 전체를 다시 로드하지 않고 애플리케이션이 실행 되는 동안 교환, 추가 또는 제거
      hot: false,
      // liveReload 를 활성화(true) 하려면 hot 옵션은 비활성화(false)
      liveReload: true,
      historyApiFallback: true,
    },
    configureWebpack: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
      experiments: {
        // 비동기 처리를 위한 async/await 는 한 세트.
        // 원래 await 혼자서는 동작이 불가능하나 ES2022부터는 모듈의 최상위 레벨에서 await 사용 가능.
        topLevelAwait: true,
      },
    },
    chainWebpack: (config) => {
      /* module federation plugin import */
      config.optimization.delete('splitChunks');
      config
        .plugin('module-federation-plugin')
        .use(require('webpack').container.ModuleFederationPlugin, [
          {
            name: 'remoteContrabass',
            filename: 'remoteEntry.js',
            remotes: {
              hostMaestro: `hostMaestro@${process.env.FEDERATION_HOST_MAESTRO_CLIENT_HOST}/remoteEntry.js`,
              remoteCommonUI: `remoteCommonUI@${process.env.FEDERATION_REMOTE_COMMON_UI_CLIENT_HOST}/remoteEntry.js`,
            },
            exposes: {
              './ContrabassApp': './src/ContrabassApp.vue',
              './ContrabassRoutes': './src/router/index.ts',
              './infra-management/ContrabassConnectionCreate':
                './src/views/maestro/infra-management/ContrabassConnectionCreate.vue',
            },
            // TODO: shared 정리
            shared: ['vue', 'vue-router', 'pinia'],
          },
        ]);
    },
  };
});
