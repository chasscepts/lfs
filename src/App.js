import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import store from './app/store';

import appApi from './store';
import LoadingBar from './LoadingBar';
import icon from './fileIcons';
import './index.css';
import bar from './bar.png';
import uploadIcon from './upload.png';
import FileBrowser from './components/FileBrowser';

const styles = {
  container: {
    display: 'flex',
    flexFlow: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    flex: '0 0 45px',
    backgroundImage: `url(${bar})`,
    backgroundSize: '100% 100%',
    display: 'flex',
    padding: '0 15px',
    alignItems: 'center',
  },
  headerAddress: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
  },
  headerUploadBtn: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${uploadIcon})`,
    backgroundSize: '100% 100%',
    width: '30px',
    height: '20px',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  uploadInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    left: '-1000px',
  },
  uploadBtn: {
    color: '#fff',
    backgroundColor: '#62b5e5',
    border: 'none',
    outline: 'none',
    padding: '7px 15px',
    margin: '0 10px',
    borderRadius: '3px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  uploadFormCover: {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  uploadFormBody: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '5px',
    maxWidth: '450px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
    padding: '5px',
  },
  ul: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'top',
    overflow: 'auto',
  },
  fileWrap: {
    padding: '5px',
  },
  file: {
    display: 'flex',
    flexFlow: 'column nowrap',
    width: '100px',
    padding: '5px',
    color: 'inherit',
    border: '1px solid transparent',
    borderRadius: '3px',
    cursor: 'default',
    alignItems: 'center',
    textDecoration: 'none',
  },
  fileHover: {
    border: '1px solid #62b5e5',
    background: 'linear-gradient(#bfdae9, #e8f3fb)',
  },
  icon: {
    width: '45px',
    height: '50px',
  },
  name: {
      width: '80px',
    textAlign: 'center',
    overflowWrap: 'anywhere',
    padding: '10px 0 3px',
    fontSize: '0.9rem',
  },
  headerBtn: {
    outline: 'none',
    border: '1px solid transparent',
    padding: '2px',
    background: 'transparent',
    margin: '0',
  },
  headerBtnHovered: {
    border: '1px solid #ddd',
    background: 'linear-gradient(#1c92d2, #f2fcfe)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: 'block',
    listStyle: 'none',
  },
  listItemLink: {
    display: 'block',
    width: '100%',
    cursor: 'pointer',
    color: 'inherit',
    textDecoration: 'none',
    padding: '4px 10px',
    backgroundColor: '#fff',
  },
  listItemLinkHovered: {
    backgroundColor: '#62b5e5',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};

const ListItem = ({ text, onClick, isSelected, close }) => {
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    close();
  }

  let style = styles.listItemLink;
  if (hovered || isSelected) {
    style = {  ...style, ...styles.listItemLinkHovered };
  }

  return (
    <li style={styles.listItem}>
      <a style={style} href="/" onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {text}
      </a>
    </li>
  )
};

const ContextMenu = ({ element, width, height, items }) => {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });

  const stopPropagation = (e) => e.stopPropagation();

  const close = () => {
    window.removeEventListener('mousedown', close);
    setOpen(false);
  }

  const minWidth = width || 300;
  const minHeight = height || 100;
  const inset = { h: 'left', v: 'top' }

  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    document.addEventListener('mousedown', close);
    const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
    const x = e.pageX;
    const y = e.pageY;
    if (x + minWidth + 50 > width && x > width / 2) {
      inset.h = 'right';
    }
    if (y + minHeight + 50 > height && y > height / 2) {
      inset.v = 'bottom';
    }
    setAnchor({ x, y });
    setOpen(true);
  });

  if (!open) return <></>;

  const style = {
    position: 'fixed',
    backgroundColor: '#fff',
    zIndex: 2000,
    boxShadow: '1px 0 1px 1px #ccc',
    minWidth,
    minHeight,
  };
  style[inset.h] = anchor.x;
  style[inset.v] = anchor.y;

  return (
    <section style={style} onMouseDown={stopPropagation}>
      <ul style={styles.list}>
        {Object.keys(items).map((key) => (
          <ListItem key={key} text={key} onClick={items[key]} close={close}/>
        ))}
      </ul>
    </section>
  );
};

const UploadForm = ({path}) => {
  const [file, setFile] = useState(null);
  const fileInput = useRef(null);
  const form = useRef(null);

  const handleFileChange = ({ target }) => {
    setFile(target.files && target.files[0]);
  };

  const openDialog = () => {
    fileInput.current.click();
  }

  const upload = (evt) => {
    evt.preventDefault();
    const data = new FormData(form.current);
    appApi.upload('/upload', data)
      .then((res) => res.json())
      .then((json) => {
        fileInput.current.value = null;
        setFile(null);
        console.log(json);
      })
      .catch((err) => console.log(err));
  };

  const cancel = () => {
    fileInput.current.value = null;
    setFile(null);
  };
  
  return (
    <form onSubmit={upload} ref={form} method="POST" encType="multipart/form-data">
      <input style={styles.uploadInput} ref={fileInput} type="file" name="file" onChange={handleFileChange} />
      <input type="hidden" name="path" value={path} />
      {!file && (
      <button style={styles.headerUploadBtn} type="button" onClick={openDialog} title="Upload file to this folder"></button>
      )}
      {file && (
      <div style={styles.uploadFormCover}>
        <div style={styles.uploadFormBody}>
          <div>Selected file {file.name} will be uploaded to {path}</div>
          <div style={styles.controls}>
            <button style={styles.uploadBtn} type="button" onClick={cancel}>Cancel</button>
            <button name="submit" style={styles.uploadBtn} type="submit">Upload</button>
          </div>
        </div>
      </div>
      )}
    </form>
  );
};

const HeaderButton = ({ html, path, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const handleClick = () => onClick(path);
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  let btnStyle = styles.headerBtn;
  if (hovered) {
    btnStyle = { ...btnStyle, ...styles.headerBtnHovered };
  }

  return (
    <button
      style={btnStyle}
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
        {html}
    </button>
  );
}

const Header = ({ path, root, onClick }) => {
  const relativePath = path.split(root.path).filter(Boolean)[0];
  const parts = (relativePath || '').split(root.sep).filter(Boolean);
  let accm = root.path;

  return (
    <div style={styles.header}>
      <div style={styles.headerAddress}>
        <HeaderButton html="root" path={root.path} onClick={onClick} />
        {parts.map((p) => {
          accm = `${accm}${root.sep}${p}`;
          return (
            <React.Fragment  key={accm}>
              <span>/</span>
              <HeaderButton html={p} path={accm} onClick={onClick} />
            </React.Fragment>
          );
        })}
      </div>
      <UploadForm path={path} />
    </div>
  );
};

const name = (file) => file.length > 30 ? `${file.substr(0, 30)} ...` : file;

const size = (bytes) => {
  if (bytes < 1000) return `${bytes}B`;
  if (bytes < 1000000) return `${Math.floor(bytes / 1000)}KB`;
  if (bytes < 1000000000) return `${Math.floor(bytes / 1000000)}MB`;
  if (bytes < 1000000000000) return `${Math.floor(bytes / 1000000000)}GB`;
  if (bytes < 1000000000000000) return `${Math.floor(bytes / 1000000000000)}TB`;
  return `${bytes}`;
};

const File = ({ file, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const wrap = useRef(null);
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);
  const fileClick = (e) => e.preventDefault();
  const openFile = () => {
    console.log('Open File!');
  }
  const fileDBClick = (e) => {
    e.preventDefault();
    if (file.isDirectory) {
      onClick(file);
    } else {
      openFile();
    }
  }

  let fileStyle = styles.file;
  if (hovered) {
    fileStyle = { ...fileStyle, ...styles.fileHover };
  }

  let title = file.name;
  if (file.isFile) {
    title = `${title}\nSize: ${size(file.size)}`;
  }

  const menuItems = {
    open: file.isDirectory ?  () => onClick(file) : openFile,
  };

  if (file.isFile) {
    menuItems.download = () => onClick(file)
  }

  return (
    <div
      style={styles.fileWrap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={wrap}
    >
      <a href={file.path} style={fileStyle} onClick={fileClick} onDoubleClick={fileDBClick} title={title}>
        <img style={styles.icon} src={icon(file.name, file.isDirectory)} />
        <div style={styles.name}>{name(file.name)}</div>
      </a>
      {wrap.current && (
      <ContextMenu element={wrap.current} items={menuItems} width={120} height={80} />
      )}
    </div>
  )
};

export const App1 = () => {
  const [currentDir, setCurrentDir] = useState(null);
  const [root, setRoot] = useState(appApi.root());
  const [loading, setLoading] = useState(false);

  const listDir = (path) => {
    setLoading(true);
    appApi.listDir(path)
      .then((obj) => {
        setCurrentDir(obj);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const clickHandler = (fileObject) => {
    if (fileObject.isFile) {
      appApi.downloadFile(fileObject.path, fileObject.name);
    } else if (fileObject.isDirectory) {
      if (fileObject.path === currentDir.path) return;
      listDir(fileObject.path);
    }
  };

  useEffect(() => {
    if (root || loading) return;
    setLoading(true);
    appApi.listDir()
      .then((fileObject) => {
        setCurrentDir(fileObject);
        setRoot(fileObject);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  });
  if (!root || loading) {
    return <LoadingBar />;
  }

  if (!currentDir) {
    return <></>;
  }

  return (
    <div style={styles.container}>
      <Header path={currentDir.path} root={root} onClick={listDir} />
      <ul style={styles.ul}>
      {currentDir.children.map((file) => (
      <li key={file.name}><File file={file} onClick={clickHandler} /></li>
      ))}
      </ul>
    </div>
  );
};

const App = () => {
  <React.StrictMode>
    <Provider store={store}>
      <FileBrowser />
    </Provider>
  </React.StrictMode>
};

export default App;
