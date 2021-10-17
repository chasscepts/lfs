import React from 'react';
import PropTypes from 'prop-types';
import style from './listItem.module.css';

const ListItem = ({ text, onClick, isSelected }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  }

  return (
    <li className={style.item}>
      <a className={style.link} href="/" onClick={handleClick}>{text}</a>
    </li>
  );
};

ListItem.propTypes = {
  text: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

ListItem.defaultProps = {
  isSelected: false,
};

export default ListItem;
