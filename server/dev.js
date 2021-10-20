const fs = require('fs');
const childProcess = require('child_process');
const express = require('express');
const webpack = require('webpack');
const multer = require('multer');
const config = require('../webpack.config');
const fileServer = require('./fileServer');
const path = require('path');
const upload = multer();

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

/**
 * @param {express.Request} req request
 * @param {express.Response} res response
 * @param {express.Handler} next next handler
 */
const api = (req, res, next) => {
  if (req.path.startsWith('/download')) {
    const { path } = req.query;
    if (fs.existsSync(path)) {
      res.download(path);
    } else {
      res.status(404).json({ mesage: 'File not found' });
    }
  } else if (req.path.startsWith('/list-dir')) {
    const { path } = req.query;
    fileServer.list(path)
      .then((rslt) => res.json(rslt))
      .catch(() => res.status(404).json({ message: 'Directory not found' }));
  } else {
    next();
  }
};

app.use(api).use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
  }),
).use(
  require(`webpack-hot-middleware`)(compiler, {
    log: false,
    path: `/__webpack_hmr`,
    heartbeat: 10 * 1000,
  }),
);

app.post('/upload', upload.single('file'), (req, res) => {
  const { originalname, buffer } = req.file;
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  let newName = originalname;
  const { path: dir } = req.body;
  let counter = 0;
  let file = path.join(dir, newName);
  while(fs.existsSync(file)) {
    counter += 1;
    newName = `${name}-${counter}${ext}`;
    file = path.join(dir, newName);
  }
  fs.writeFileSync(file, buffer);
  const stat = fs.statSync(file);
  res.json({
    name: newName,
    parent: dir,
    path: file,
    size: stat.size,
    isFile: true,
    isDirectory: false,
  })
});

app.get('/create-dir', (req, res) => {
  const { name, parent } = req.query;
  fileServer.createFolder(name, parent)
    .then((rslt) => res.json(rslt))
    .catch((err) => res.status(404).json(err));
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`LFS listening on port ${port}!`);
  openBrowser(`http://localhost:${port}`);
});



process.on('SIGINT', () => {
  server.close();
  process.exit();
});
