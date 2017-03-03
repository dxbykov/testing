var path = require('path');
var webpack = require('webpack');

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
    plugins: [
        new webpack.DefinePlugin({
            "process.env": { 
                NODE_ENV: JSON.stringify("development") 
            }
        })
    ],
    devtool: 'eval-source-map',
    devServer: {
        host: '0.0.0.0',
        port: 3002,
    }
}