const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');
const selectorParser = require('postcss-selector-parser');

module.exports = {
  purge: [],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
    backgroundColor: theme => ({
      ...theme('colors'),
      'dark-content': '#18181C',
      'dark-model': '#2C2C32'
    })
  },
  variants: {
    extend: {
      textOpacity: ['dark'],
      backgroundColor: ['dark'],
    }
  },
  plugins: [
    plugin(function ({ addVariant, prefix, e }) {
      addVariant('dark', ({ modifySelectors, separator }) => {
        modifySelectors(({ selector }) => {
          return selectorParser((selectors) => {
            selectors.walkClasses((sel) => {
              sel.value = `dark${separator}${sel.value}`;
              sel.parent.insertBefore(sel, selectorParser().astSync(prefix('.dark-mode ')));
            });
          }).processSync(selector);
        });
      });
    })
  ],
  corePlugins: {
    preflight: false
  }
};
