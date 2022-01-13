import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import style from './style.module.css';
import { selectIsDrawerOpen, closeDrawer } from '../../reducers/drawerSlice';
import Hamburger from '../Hamburger';

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
        Drawer
      </div>
    </div>
  );
};

Drawer.propTypes = {
  children: PropTypes.elementType,
};

Drawer.defaultProps = {
  children: null,
};

export default Drawer;
