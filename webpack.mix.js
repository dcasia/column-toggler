let mix = require('laravel-mix')

require('./nova.mix')
require('mix-tailwindcss')

mix
  .setPublicPath('dist')
  .js('resources/js/tool.js', 'js')
  .vue({ version: 3 })
  .postCss('resources/css/tool.css', 'css')
  .tailwind()
  .nova('digital-creative/column-toggler')
