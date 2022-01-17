import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createDirAsync,
  loadDirAsync,
  selectCurrentDir, selectDirectoryError,
  selectDirectoryLoading,
} from '../../reducers/dirSlice';
import LoadingBar from '../LoadingBar';
import AddressBar from './AddressBar';
import File from './File';
import style from './css/index.module.css';
import FileUploader from '../FileUploader';
import ContextMenu from '../ContextMenu';
import { openUploadForm } from '../../reducers/filesSlice';
import { pushNotification } from '../../reducers/notificationSlice';

const Body = ({ newFolderClick }) => {
  const [menu, setMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const dir = useSelector(selectCurrentDir);
  const error = useSelector(selectDirectoryError);
  const dispatch = useDispatch();

  if (error) {
    console.log(error);
    return (
      <div className={style.errorWrap}>
        <div className={style.error}>
          <h5>The requested folder could not be loaded.</h5>
          <h6>This could as a result of the following issues</h6>
          <ul>
            <li>Network problems</li>
            <li>The directory may have been deleted on the server</li>
            <li>The directory is not readable</li>
          </ul>
        </div>
      </div>
    );
  }

  const closeMenu = () => {
    window.removeEventListener('mousedown', closeMenu);
    setMenu({ isOpen: false, x: 0, y: 0 });
  }

  const showMenu = (e) => {
    e.preventDefault();
    document.addEventListener('mousedown', closeMenu);
    setMenu({ isOpen: true, x: e.pageX, y: e.pageY });
  };

  const menuItems = {
    'Upload File': () => {
      closeMenu();
      dispatch(openUploadForm(true));
    },
    'New Folder': () => {
      closeMenu();
      newFolderClick();
    },
  };

  return (
    <div className={style.filesPanel} onContextMenu={showMenu}>
      <div className={style.listWrap}>
        <ul className={style.ul}>
          {dir.children.map((file) => (
          <li key={file.name}><File file={file} /></li>
          ))}
        </ul>
      </div>
      {menu.isOpen && <ContextMenu items={menuItems} x={menu.x} y={menu.y} w={120} h={80} />}
      <FileUploader />
    </div>
  );
}

export default function FileBrowser() {
  const [newFolder, setNewFolder] = useState({ isOpen: false, name: '' });
  const dir = useSelector(selectCurrentDir);
  const loading = useSelector(selectDirectoryLoading);
  const dispatch = useDispatch();
  if (!dir) {
    dispatch(loadDirAsync());
  }

  const newFolderClick = () => setNewFolder({ isOpen: true, name: '' });

  const closeTextInput = () => setNewFolder({ isOpen: false, name: '' });

  const handleValueChange = ({ target: { name, value } }) => {
    if (name === 'newFolderName') {
      setNewFolder({ isOpen: true, name: value });
    }
  };

  const createFolder = (e) => {
    e.preventDefault();
    const lowcase = newFolder.name.toLowerCase();
    const sameName = dir.children.find((child) => child.isDirectory && child.name.toLowerCase() === lowcase);
    if (sameName) {
      dispatch(pushNotification({ type: 'error', text: 'A directory with same name already exists' }));
      return;
    }
    setNewFolder({ isOpen: false, name: '' });
    dispatch(createDirAsync(newFolder.name, dir.path));
  };
  
  return (
    <div className={style.container}>
      <AddressBar />
      {!loading && <Body newFolderClick={newFolderClick} />}
      {loading && <LoadingBar />}
      {newFolder.isOpen && (
      <div className={style.cover}>
        <form className={style.textInputBody} onSubmit={createFolder}>
          <div>New Folder Name</div>
          <input
            name="newFolderName"
            className={style.textInputField}
            type="text"
            value={newFolder.name}
            onChange={handleValueChange}
          />
          <div className={style.controls}>
            <button className={style.btn} type="button" onClick={closeTextInput}>Cancel</button>
            <button className={style.btn} type="submit">Enter</button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
