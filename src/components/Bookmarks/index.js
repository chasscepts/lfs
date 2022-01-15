import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import css from './style.module.css';
import { selectBookmarks, setBookmarks } from '../../reducers/bookmarkSlice';
import { loadDirAsync } from '../../reducers/dirSlice';
import {
  deleteBookmark,
  getAllBookmarks, updateBookmark,
} from '../../utility/clientStorage';

const BookmarkRow = ({ path, title, onClick, onEdit, onDelete }) => {
  const handleClick = ({ target: { name }}) => {
    if (name === 'open') {
      onClick(path);
    } else if (name === 'edit') {
      onEdit({ path, title });
    } else if (name === 'delete') {
      onDelete(path);
    }
  }

  return (
    <li className={css.listItem}>
      <button
        type='button'
        name='open'
        className={css.openBtn}
        onClick={handleClick}
        title={path}
      >
        {title}
      </button>
      <div className={css.controls}>
        <button
          type='button'
          name='edit'
          className={css.controlBtn}
          onClick={handleClick}
          title='Edit'
        >
          <svg viewBox="0 0 24 24" className={css.svg}>
            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
          </svg>
        </button>
        <button
          type='button'
          name='delete'
          className={css.controlBtn}
          onClick={handleClick}
          title='Delete'
        >
          <svg viewBox="0 0 24 24" className={css.svg}>
            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
          </svg>
        </button>
      </div>
    </li>
  );
};

const Bookmarks = () => {
  const [edited, setEdited] = useState();
  const [newTitle, setNewTitle] = useState('');
  const bookmarks = useSelector(selectBookmarks);
  const dispatch = useDispatch();
  const editSlide = useRef(null);

  useEffect(() => {
    if (editSlide.current) {
      editSlide.current.classList.add(css.open);
    }
  }, [edited]);

  if (bookmarks === null) {
    dispatch(setBookmarks(getAllBookmarks()));
    return <></>;
  }

  const openFolder = (path) => {
    dispatch(loadDirAsync(path));
  };

  const edit = (bookmark) => setEdited(bookmark);

  const closeEditor = () => {
    if (editSlide.current) {
      editSlide.current.classList.remove(css.open);
    }
  };

  const handleTitleChange = ({ target }) => setNewTitle(target.value);

  const commitEdit = () => {
    if (!newTitle) return;
    updateBookmark(edited.path, newTitle);
    setEdited(null);
    dispatch(setBookmarks(getAllBookmarks()));
  };

  const removeBookmark = (path) => {
    deleteBookmark(path);
    dispatch(setBookmarks(getAllBookmarks()));
  };

  return (
    <div className={css.container}>
      <h4 className={css.header}>Bookmarks</h4>
      {edited && (
      <div className={css.editSlide} ref={editSlide}>
        <div className={css.editBody}>
          <h5 className={css.editHeader}>Editing {edited.title} Bookmark</h5>
          <input 
            className={css.editInput}
            placeholder='Enter New Title'
            value={newTitle}
            onChange={handleTitleChange}
          />
          <div className={css.editControls}>
            <button
              className={`${css.editBtn} ${css.green}`}
              type="button"
              onClick={commitEdit}
            >
              Done
            </button>
            <button
              className={`${css.editBtn} ${css.red}`}
              type="button"
              onClick={closeEditor}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      )}
      <ul className={css.list}>
        {bookmarks.map((bk) => (
        <BookmarkRow
          key={bk.path}
          path={bk.path}
          title={bk.title}
          onClick={openFolder}
          onEdit={edit}
          onDelete={removeBookmark}
        />))}
      </ul>
    </div>
  );
};

export default Bookmarks;
