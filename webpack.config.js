var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, "src", "r3test.js"),

  output: {
    path: path.resolve(__dirname, "scripts"),
    publicPath: "/scripts/",
    filename: "r3test.js"
  },
  
  module: {
    loaders: [
      {
	test: /\.js$/,
	loader: 'babel',
	include: path.join(__dirname, 'src')
      }
    ]
  }
}
