module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'airbnb-typescript/base'
  ],
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  rules: {
    'no-plusplus': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    "@typescript-eslint/semi": [
      "error",
      "never"
    ],
    "no-shadow": "off",
    "no-multiple-empty-lines": [
      "error",
      {
        "max": 1,
        "maxEOF": 1,
        "maxBOF": 0
      }
    ],
    "curly": [
      "error",
      "multi"
    ],
    "padding-line-between-statements": [
      "error",
      {
        "blankLine": "never",
        "prev": [
          "expression",
          "const",
          "let",
          "var",
          "for",
          "empty"
        ],
        "next": [
          "expression",
          "const",
          "let",
          "var",
          "for",
          "empty"
        ]
      },
      {
        "blankLine": "always",
        "prev": "*",
        "next": [
          "if",
          "return",
          "throw",
          "function",
          "class",
          "export",
          "cjs-export"
        ]
      },
      {
        "blankLine": "always",
        "prev": [
          "if",
          "function",
          "class",
          "cjs-import",
          "import"
        ],
        "next": "*"
      },
      {
        "blankLine": "never",
        "prev": [
          "cjs-import",
          "import"
        ],
        "next": [
          "cjs-import",
          "import"
        ]
      },
      {
        "blankLine": "never",
        "prev": "if",
        "next": "if"
      }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "import/prefer-default-export": "off",
    "no-continue": "off",
    "no-console": "off",
    "radix": "off",
    "no-template-curly-in-string": "off",
    "max-len": [
      "error",
      120,
      2,
      {
        "ignoreUrls": true,
        "ignoreComments": false,
        "ignoreRegExpLiterals": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignorePattern": "d=\"(m|M)"
      }
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": [
          "camelCase",
          "PascalCase",
          "UPPER_CASE",
          "snake_case"
        ]
      },
      {
        "selector": "function",
        "format": [
          "camelCase",
          "PascalCase"
        ]
      },
      {
        "selector": "typeLike",
        "format": [
          "PascalCase"
        ]
      }
    ],
  },
  parserOptions: {
    project: './tsconfig.json',
  },
}
