import React from 'react';
import PropTypes, { string } from 'prop-types';
import style from './index.module.css';
import ListItem from './ListItem';

const ContextMenu = ({ items, x, y, w, h, onClose }) => {
  const stopPropagation = (e) => e.stopPropagation();

  let x0 = x;
  let y0 = y;

  const minWidth = w || 300;
  const minHeight = h || 100;
  const inset = { h: 'left', v: 'top' }

  const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;

  if (x + minWidth + 50 > width && x > width / 2) {
    inset.h = 'right';
    x0 = width - x;
  }

  if (y + minHeight + 50 > height && y > height / 2) {
    inset.v = 'bottom';
    y0 = height - y;
  }

  const containerStyle = {
    [inset.h]: x0,
    [inset.v]: y0,
    minWidth,
    minHeight,
  };
  
  return (
    <section className={style.container} style={containerStyle} onMouseDown={stopPropagation}>
      <ul className={style.list}>
        {Object.keys(items).map((key) => (
          <ListItem key={key} text={key} onClick={items[key]} />
        ))}
      </ul>
    </section>
  );
};

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  w: PropTypes.number,
  h: PropTypes.number,
  items: PropTypes.shape({
    [string]: PropTypes.func,
  }).isRequired,
};

ContextMenu.defaultProps = {
  width: 300,
  height: 100,
};

export default ContextMenu;
