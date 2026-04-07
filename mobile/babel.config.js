const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
          // Resolve from mobile package root (avoid `root: ['./src']` + `@` alias clashes in app/)
          alias: {
            '@': path.resolve(__dirname, 'src'),
          },
        },
      ],
    ],
  };
};
