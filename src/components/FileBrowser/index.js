import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadDirAsync,
  selectCurrentDir, selectDirectoryError,
  selectDirectoryLoading, selectRootDirectory,
} from '../../reducers/dirSlice';
import LoadingBar from '../LoadingBar';
import AddressBar from './AddressBar';
import File from './File';
import style from './css/index.module.css';

const Body = () => {
  const dir = useSelector(selectCurrentDir);
  const error = useSelector(selectDirectoryError);

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
  return (
    <ul className={style.ul}>
      {dir.children.map((file) => (
      <li key={file.name}><File file={file} /></li>
      ))}
    </ul>
  );
}

export default function FileBrowser() {
  const dir = useSelector(selectCurrentDir);
  const loading = useSelector(selectDirectoryLoading);
  const dispatch = useDispatch();
  if (!dir) {
    dispatch(loadDirAsync());
  }
  
  return (
    <div className={style.container}>
      <AddressBar />
      {!loading && <Body />}
      {loading && <LoadingBar />}
    </div>
  );
}
