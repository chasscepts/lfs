import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import css from './style.module.css';
import { selectBookmarks, setBookmarks } from '../../reducers/bookmarkSlice';
import { loadDirAsync } from '../../reducers/dirSlice';
import {
  getAllBookmarks,
} from '../../utility/clientStorage';

const BookmarkRow = ({ path, title, onClick }) => {
  const handleClick = () => onClick(path);

  return (
    <li className={css.listItem}>
      <button
        type='button'
        className={css.openBtn}
        onClick={handleClick}
        title={path}
      >
        {title}
      </button>
    </li>
  );
};

const Bookmarks = () => {
  const bookmarks = useSelector(selectBookmarks);
  const dispatch = useDispatch();

  if (bookmarks === null) {
    dispatch(setBookmarks(getAllBookmarks()));
    return <></>;
  }

  const openFolder = (path) => {
    dispatch(loadDirAsync(path));
  };

  return (
    <div className={css.container}>
      <h4 className={css.header}>Bookmarks</h4>
      <ul className={css.list}>
        {bookmarks.map((bk) => (
        <BookmarkRow
          key={bk.path}
          path={bk.path}
          title={bk.title}
          onClick={openFolder}
        />))}
      </ul>
    </div>
  );
};

export default Bookmarks;
