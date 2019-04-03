const path = require("path");

module.exports = {
  outputDir: path.resolve(__dirname, "../../Resources/Public/JavaScript/Library/"),
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
      }, {
        'TYPO3/CMS/Backend/Icons': 'TYPO3/CMS/Backend/Icons',
      }
    ],
  }
};
