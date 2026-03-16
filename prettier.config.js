/**
 * @type {import('prettier').Config}
 * https://prettier.io/docs/en/options
 */
module.exports = {
  bracketSameLine: true,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'ignore',
  importOrder: ['^[a-zA-Z0-9-]+|@[a-zA-Z]+', '^@/', '^[./]', '^[../]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  jsxSingleQuote: true,
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  printWidth: 110,
  proseWrap: 'never',
  quoteProps: 'consistent',
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  tailwindFunctions: ['cls', 'clsx']
}
