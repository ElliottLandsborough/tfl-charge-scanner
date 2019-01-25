const mix = require('laravel-mix');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');

mix.webpackConfig({
   'resolve': {
     'alias': {
       'react': 'preact-compat', // use preact for react stuff
       'react-dom': 'preact-compat', // use preact for react stuff
       'chart.js': 'chart.js/dist/Chart.js', // force non-moment version of chart to load
     },
    },
  plugins: [
    //new BundleAnalyzerPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // ignore moment locale if moment is included
  ],
});

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.options({
    postCss: [
        require('postcss-discard-comments')({
            removeAll: true
        })
    ],
    uglify: {
        comments: false
    }
});

mix.react('resources/js/app.js', 'public/js')
   .sass('resources/sass/app.scss', 'public/css');
