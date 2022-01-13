import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsDrawerOpen, toggleState } from '../../reducers/drawerSlice';
import style from './style.module.css';

const Hamburger = () => {
  const isOpen = useSelector(selectIsDrawerOpen);
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(toggleState());
  };

  const className = isOpen ? `${style.hamburger} ${style.open}` : style.hamburger;

  return (
    <button className={className} type="button" onClick={handleClick}><span /></button>
  );
}

export default Hamburger;
