import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
  },
};

const ImageViewer = ({ content, name }) => {
  const [scale, setScale] = useState(1);

  const handleMouseWheel = (evt) => {
    evt.stopPropagation();
    const temp = scale + evt.deltaY * -0.001;
    setScale(Math.min(Math.max(.125, temp), 4));
  }

  const imageStyle = {
    transform: `scale(${scale})`,
  };

  return (
    <div style={styles.container}>
      <img style={imageStyle} src={content} alt={name} onWheel={handleMouseWheel} />
    </div>
  )
};

ImageViewer.propTypes = {
  content: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default ImageViewer;
