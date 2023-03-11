module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier',
    'stylelint-config-rational-order',
    'stylelint-config-recommended-less',
  ],
  rules: {
    'at-rule-no-unknown': null,
    'no-descending-specificity': null,
    'color-no-invalid-hex': true,
    'less/color-no-invalid-hex': true,
    'no-descending-specificity': null,
    'declaration-block-trailing-semicolon': null,
    'font-family-no-missing-generic-family-keyword': null,
  },
  overrides: [
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],
};
