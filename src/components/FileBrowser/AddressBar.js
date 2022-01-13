import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import style from './css/AddressBar.module.css';
import {
  loadDirAsync, selectCurrentDir, selectDirectoryError, selectRootDirectory,
} from '../../reducers/dirSlice';
import Hamburger from '../Hamburger';

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

  const bar = useRef(null);

  useEffect(() => {
    //  const bar = { current: document.querySelector('#') }
    const elm = bar.current;
    if (elm) {
      const amount = elm.scrollWidth - elm.clientWidth;
      if (amount > 0) {
        elm.scrollLeft = amount;
      }
    }
  }, []);

  if (!dir) {
    return <div className={style.container}></div>;
  }

  const handleMouseWheel = (evt) => {
    evt.stopPropagation();
    const elm = bar.current;
    if (!elm) return;
    const delta = evt.deltaY * 0.1;
    const left = elm.scrollLeft;
    let amount = left + delta;
    if (delta < 0) {
      if (left === 0) return;
      if (amount < 0) {
        amount = 0;
      }
    } else {
      const max = elm.scrollWidth - elm.clientWidth;
      if (left === max) return;
      if (amount > max) {
        amount = max;
      } 
    }
    
    elm.scrollLeft = amount;
  }

  const path = error ? error.path : dir.path;
  const rootPath = dir.root;
  const relativePath = path.split(rootPath).filter(Boolean)[0];
  const parts = (relativePath || '').split(root.sep).filter(Boolean);
  let accm = rootPath.substr(0, rootPath.length - 1);

  return (
    <div className={style.container} onWheel={handleMouseWheel}>
      <div className={style.hamburgerWrap}>
        <Hamburger />
      </div>
      <div ref={bar} className={style.address}>
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
