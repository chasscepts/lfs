const os = require('os');
const fs = require('fs');
const childProcess = require('child_process');
const express = require('express');
const webpack = require('webpack');
const multer = require('multer');
const path = require('path');
const config = require('../webpack.config');
const fileServer = require('./fileServer');

const uploadFilePath = (dir, name) => {
  const ext = path.extname(name);
  const baseName = path.basename(name, ext);
  let filename = name;
  let counter = 0;
  let file = path.join(dir, filename);
  while(fs.existsSync(file)) {
    counter += 1;
    filename = `${baseName}-${counter}${ext}`;
    file = path.join(dir, filename);
  }
  return { path: file, filename };
};

const uploadFileName = (dir, filename) => {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  let newName = filename;
  let counter = 0;
  let file = path.join(dir, newName);
  while(fs.existsSync(file)) {
    counter += 1;
    newName = `${name}-${counter}${ext}`;
    file = path.join(dir, newName);
  }
  return newName;
};

const upload = multer({ storage: multer.diskStorage({
  destination: function (req, file, cb) {
    const { path: dir } = req.body;
    const folder = dir ? dir : os.tmpdir();
    cb(null, folder)
  },
  filename: function (req, file, cb) {
    const { originalname } = file;
    const { path: dir } = req.body;
    const folder = dir ? dir : os.tmpdir();
    cb(null, uploadFileName(folder, originalname));
  }
})}).single('file');

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

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err);
      res.status(500).json({ message: err.message });
      return;
    } else if (err) {
      console.log(err);
      res.status(500).json({ message: err.message || 'Unable to upload file' });
      return;
    }

    const { file: {
      destination,
      originalname,
      size,
      filename,
      path,
    } } = req;
  
    let dir;
    let fName;
    let fullpath;
  
    if (destination === os.tmpdir()) {
      dir = req.body.dir;
      const {
        filename: tempName,
        path: fPath,
      } = uploadFilePath(dir, originalname);
      fName = tempName;
      fullpath = fPath;
      fs.rename(path, fullpath);
      console.log('Rename required');
    } else {
      dir = destination;
      fName = filename;
      fullpath = path;
      console.log('Rename NOT necessary!!!');
    }
  
    res.json({
      name: fName,
      parent: dir,
      path: fullpath,
      size,
      isFile: true,
      isDirectory: false,
    });
  });
});

// app.post('/upload', upload.single('file'), (req, res) => {
//   const { file: {
//     destination,
//     originalname,
//     size,
//     filename,
//     path,
//   } } = req;

//   let dir;
//   let fName;
//   let fullpath;

//   if (destination === os.tmpdir()) {
//     dir = req.body.dir;
//     const {
//       filename: tempName,
//       path: fPath,
//     } = uploadFilePath(dir, originalname);
//     fName = tempName;
//     fullpath = fPath;
//     fs.rename(path, fullpath);
//     console.log('Rename required');
//   } else {
//     dir = destination;
//     fName = filename;
//     fullpath = path;
//     console.log('Rename NOT necessary!!!');
//   }

//   res.json({
//     name: fName,
//     parent: dir,
//     path: fullpath,
//     size,
//     isFile: true,
//     isDirectory: false,
//   });
// });

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
