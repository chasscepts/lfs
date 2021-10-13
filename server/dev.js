const childProcess = require('child_process');
const express = require('express');
const webpack = require('webpack');
const config = require('../webpack.config');

const app = express();
const compiler = webpack(config);

const port = 5017;

const openBrowser = (url) => {
  childProcess.exec(`start ${url}`, function (err) {
    if (err) {
      console.error(err);
      return;
    }
  });
}

const api = (req, res, next) => {
  next();
}

const server = app.use(api).use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
  }),
).use(
  require(`webpack-hot-middleware`)(compiler, {
    log: false,
    path: `/__webpack_hmr`,
    heartbeat: 10 * 1000,
  }),
).listen(port, '0.0.0.0', () => {
  console.log(`LFS listening on port ${port}!`);
  openBrowser(`http://localhost:${port}`);
});
