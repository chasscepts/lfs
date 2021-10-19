import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import style from './css/AddressBar.module.css';
import {
  loadDirAsync, selectCurrentDir, selectDirectoryError, selectRootDirectory,
} from '../../reducers/dirSlice';

const AddressButton = ({ html, path }) => {
  const dispatch = useDispatch();

  const handleClick = () => dispatch(loadDirAsync(path));

  return (
    <button className={style.btn} type="button" onClick={handleClick}>{html}</button>
  );
}

AddressButton.propTypes = {
  html: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
};

const AddressBar = () => {
  const root = useSelector(selectRootDirectory);
  const dir = useSelector(selectCurrentDir);
  const error = useSelector(selectDirectoryError);

  if (!dir) {
    return <div className={style.container}></div>;
  }

  const path = error ? error.path : dir.path;
  const rootPath = dir.root;
  const relativePath = path.split(rootPath).filter(Boolean)[0];
  const parts = (relativePath || '').split(root.sep).filter(Boolean);
  let accm = rootPath.substr(0, rootPath.length - 1);

  return (
    <div className={style.container}>
      <div className={style.address}>
        <AddressButton html="root" path={rootPath} />
        {parts.map((p) => {
          accm = `${accm}${root.sep}${p}`;
          return (
            <React.Fragment  key={accm}>
              <span>/</span>
              <AddressButton html={p} path={accm} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default AddressBar;
