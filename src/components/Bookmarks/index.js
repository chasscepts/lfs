import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectBookmarks, setBookmarks } from '../../reducers/bookmarkSlice';
import {
  getAllBookmarks,
} from '../../utility/clientStorage';

const BookmarkRow = ({ path, name }) => {

};

const Bookmarks = () => {
  const bookmarks = useSelector(selectBookmarks);
  const dispatch = useDispatch();

  if (bookmarks === null) {
    dispatch(setBookmarks(getAllBookmarks()));
    return <></>;
  }

  <div>
    <h4>Bookmarks</h4>
    <ul>
      {bookmarks.map((bk) => <BookmarkRow key={} />)}
    </ul>
  </div>
};
