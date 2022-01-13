import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ContextMenu from '../ContextMenu';
import style from './css/file.module.css';
import icon from '../../fileIcons';
import api from '../../api';
import { loadDirAsync, selectActivePath, setActivePath } from '../../reducers/dirSlice';
import { useDispatch, useSelector } from 'react-redux';
import { downloadFileAsync, setActiveFile, setUseHexa } from '../../reducers/filesSlice';
import { fileSize } from '../../utility';
import { createBookmark, getAllBookmarks } from '../../utility/clientStorage';
import { setBookmarks } from '../../reducers/bookmarkSlice';

const name = (file) => file.length > 30 ? `${file.substr(0, 30)} ...` : file;

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
    dispatch(setActiveFile({ file, withViewerChooser: false }));
  };

  const openFileWith = () => {
    dispatch(setActiveFile({ file, withViewerChooser: true }));
  }

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
    title = `${title}\nSize: ${fileSize(file.size)}`;
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
    menuItems['Open With ...'] = () => {
      closeMenu();
      openFileWith();
    };
    menuItems.download = () => {
      closeMenu();
      dispatch(downloadFileAsync(file.path, file.name));
    };
    menuItems['View Hexdecimal'] = () => {
      closeMenu();
      dispatch(setUseHexa(true));
      dispatch(setActiveFile(file));
    };
  } else if (file.isDirectory) {
    const bookmarks = getAllBookmarks();
    const existing = bookmarks.find((b) => b.path === file.path);
    if (!existing) {
      menuItems['Bookmark Folder'] = () => {
        closeMenu();
        createBookmark(file.path, file.name);
        dispatch(setBookmarks(getAllBookmarks()));
      };
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
