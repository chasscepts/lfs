module.exports = (api) => {
  // This caches the Babel config
  api.cache.using(() => process.env.NODE_ENV);
  return {
    presets: [
      '@babel/preset-env',
      // Enable development transform of React with new automatic runtime
      ['@babel/preset-react', { development: !api.env('production'), runtime: 'automatic' }],
    ],
    plugins: [
      '@babel/plugin-syntax-jsx',
      ['prismjs', {
        'languages': [
          'javascript', 'css', 'markup', 'html',
          'markdown', 'c', 'cpp', 'cs', 'ruby', 'python', 'java', 'scss', 'php', 'svg',
          'csv', 'json', 
        ],
        'plugins': ['line-numbers'],
        'theme': 'default',
        'css': true,
      }],
      // Applies the react-refresh Babel plugin on non-production modes only
      (!api.env('production') && 'react-refresh/babel')
    ].filter(Boolean),
  };
};
