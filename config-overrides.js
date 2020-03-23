const { 
    override, 
    fixBabelImports, 
    addLessLoader,
    addDecoratorsLegacy, 
    addWebpackAlias
} = require('customize-cra');
const path = require('path');

const rewiredMap = () => config => {
    config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false;
    return config;
};

module.exports = override(
    //antd按需引入和主题配置
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        modifyvars: {
          "@icon-url": `${path.resolve(__dirname,'build/assets/font/iconfont')}`, //使用本地字体文件
          '@font-size-base': '13px',
          '@primary-color': '#00879C'
        },
        javascriptEnabled: true
    }),
    addWebpackAlias({
        '@': path.resolve(__dirname, 'src')
    }),
    //装饰器
    addDecoratorsLegacy(),
    //关闭sourcemap，打包后不会再出现js和css的map文件
    rewiredMap()
)