import React from 'react';
import { useSelector } from 'react-redux';
import style from './style.module.css';
import { selectIsDrawerOpen, closeDrawer } from '../../reducers/drawerSlice';
import Hamburger from '../Hamburger';
import Bookmarks from '../Bookmarks';

const Drawer = () => {
  const open = useSelector(selectIsDrawerOpen);

  let drawerClass = style.drawer;
  if (open) {
    drawerClass = `${drawerClass} ${style.open}`;
  }

  return (
    <div className={drawerClass}>
      <div className={style.header}>
        <Hamburger />
      </div>
      <div className={style.body}>
        <Bookmarks />
      </div>
    </div>
  );
};

export default Drawer;
