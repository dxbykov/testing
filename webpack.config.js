var path = require('path');

module.exports = {
    context: __dirname,
    entry: {
        index: path.join(__dirname, 'index')
    },
    output: {
		publicPath: '/dist',
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components|public\/)/,
                use: ["babel-loader"]
            },
            { 
                test: /\.css$/, 
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".jsx"]
    },
    devtool: 'eval-source-map'
}