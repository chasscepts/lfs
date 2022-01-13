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

/**
 * @param {string} svg
 */
const getDimensions = (svg) => {
  const dim = { width: '100%', height: '100%', };

  const matches = svg.match(/viewBox="(.*?)"/);
  if (matches) {
    const m = matches[1];
    if (m) {
      const parts = m.split(' ');
      if (parts.length === 4) {
        dim.width = `${parts[2]}px`;
        dim.height = `${parts[3]}px`;
      }
    }
  }

  return dim;
};

export const SvgViewer = ({ content, name }) => {
  const [scale, setScale] = useState(1);

  const handleMouseWheel = (evt) => {
    evt.stopPropagation();
    const temp = scale + evt.deltaY * -0.001;
    setScale(Math.min(Math.max(.125, temp), 4));
  }

  const imageStyle = {
    transform: `scale(${scale})`,
  };

  const dim = getDimensions(content);

  const html = content.replace('<svg ', `<svg style="width: ${dim.width};height:${dim.height};" `);

  return (
    <div style={styles.container}>
      <div style={imageStyle} onWheel={handleMouseWheel} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
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
  );
};

ImageViewer.propTypes = {
  content: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default ImageViewer;
