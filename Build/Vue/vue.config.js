module.exports = {
  configureWebpack: {
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    },
    externals: [
      {
        // Object
        vue$: {
          commonjs: 'Vue',
          amd: 'Vue',
          root: 'Vue' // indicates global variable
        },
      }
    ]
  }
};
