import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ContextMenu from '../ContextMenu';
import style from './css/file.module.css';
import icon from '../../fileIcons';
import { loadDirAsync, selectActivePath, setActivePath } from '../../reducers/dirSlice';
import { useDispatch, useSelector } from 'react-redux';
import { downloadFileAsync, setActiveFile } from '../../reducers/filesSlice';

const name = (file) => file.length > 30 ? `${file.substr(0, 30)} ...` : file;

const size = (bytes) => {
  if (bytes < 1000) return `${bytes}B`;
  if (bytes < 1000000) return `${Math.floor(bytes / 1000)}KB`;
  if (bytes < 1000000000) return `${Math.floor(bytes / 1000000)}MB`;
  if (bytes < 1000000000000) return `${Math.floor(bytes / 1000000000)}GB`;
  if (bytes < 1000000000000000) return `${Math.floor(bytes / 1000000000000)}TB`;
  return `${bytes}`;
};

const File = ({ file }) => {
  const [menu, setMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const activePath = useSelector(selectActivePath);
  const dispatch = useDispatch();
  const wrap = useRef();
  const isActive = activePath && activePath.path === file.path;

  const fileClick = (e) => {
    e.preventDefault();
    if (!isActive) {
      dispatch(setActivePath(file));
    }
  };

  const openFile = () => {
    dispatch(setActiveFile(file));
  };

  const fileDBClick = (e) => {
    e.preventDefault();
    if (file.isDirectory) {
      dispatch(loadDirAsync(file.path));
    } else {
      openFile();
    }
  };

  const closeMenu = () => {
    window.removeEventListener('mousedown', closeMenu);
    setMenu({ isOpen: false, x: 0, y: 0 });
  }

  const showMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isActive) {
      dispatch(setActivePath(file));
    }
    document.addEventListener('mousedown', closeMenu);
    setMenu({ isOpen: true, x: e.pageX, y: e.pageY });
  };

  let title = file.name;
  if (file.isFile) {
    title = `${title}\nSize: ${size(file.size)}`;
  }

  const menuItems = {
    open: () => {
      closeMenu();
      if (file.isDirectory) {
        dispatch(loadDirAsync(file.path));
      } else {
        openFile();
      }
    },
  };

  if (file.isFile) {
    menuItems.download = () => {
      closeMenu();
      dispatch(downloadFileAsync(file.path));
    }
  }

  const fileClass = isActive ? `${style.file} ${style.active}` : style.file;

  return (
    <div className={style.fileWrap} ref={wrap} onContextMenu={showMenu}>
      <a href={file.path} className={fileClass} onClick={fileClick} onDoubleClick={fileDBClick} title={title}>
        <img className={style.icon} src={icon(file.name, file.isDirectory)} />
        <div className={style.name}>{name(file.name)}</div>
      </a>
      {menu.isOpen && <ContextMenu items={menuItems} x={menu.x} y={menu.y} w={120} h={80} />}
    </div>
  );
};

File.propTypes = {
  file: PropTypes.shape({
    path: PropTypes.string.isRequired,
    isFile: PropTypes.bool.isRequired,
    isDirectory: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default File;
