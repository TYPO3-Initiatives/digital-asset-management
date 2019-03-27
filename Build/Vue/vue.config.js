module.exports = {
  configureWebpack: {
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
