var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        index: 'index'
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
            }
        ]
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js"]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": { 
                //NODE_ENV: JSON.stringify("production")
            }
        })
    ],
    devtool: 'eval-source-map'
}