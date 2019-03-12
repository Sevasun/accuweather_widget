let path = require('path');

let conf = {
    entry: './js/main.js',
    output: {
        path: path.resolve(__dirname, './js'),
        filename: 'script.js',
        publicPath: 'js/'
    },
    devServer: {
        overlay: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: '/node_modules/'
            }
        ]
    }
}

module.exports = (env, options) => {
    conf.devtool = options.mode === "production" ?
                    "source-map" :
                    "cheap-module-source-map";
    return conf;
}
