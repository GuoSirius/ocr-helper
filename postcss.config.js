const USE_POSTCSS_NESTING = false

const postcssNesting = USE_POSTCSS_NESTING ? require('postcss-nesting') : void 0
const postcssPresetEnvOptions = USE_POSTCSS_NESTING ? { features: { 'nesting-rules': false } } : void 0

module.exports = {
  // plugins: {
  //   tailwindcss: {},
  //   autoprefixer: {},
  // },
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting')(postcssNesting),
    require('tailwindcss'),
    require('postcss-preset-env')(postcssPresetEnvOptions),
    require('autoprefixer'),
  ]
}
