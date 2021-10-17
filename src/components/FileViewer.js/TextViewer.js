import React, { useState } from 'react';
import PropTypes from 'prop-types';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#a8a6b4',
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    maxWidth: '720px',
    overflow: 'hidden',
    margin: 'auto',
    backgroundColor: '#fff',
  },
  menuBar: {
    backgroundColor: '#c3ddef',
    padding: '5px',
    display: 'flex',
  },
  menuItemWrap: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
  },
  mx5: {
    marginLeft: '5px',
    marginRight: '5px',
  },
  preCon: {
    flex: 1,
    overflow: 'auto',
    padding: '25px',
  },
};

const TextViewer = ({ content }) => {
  const [wrap, setWrap] = useState(false);

  const handleWrapChange = () => setWrap(!wrap);

  const preClass = wrap ? 'pre-wrap' : '';

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.menuBar}>
          <label style={styles.menuItemWrap}>
            <input type="checkbox" checked={wrap} onChange={handleWrapChange} />
            <span style={styles.mx5}>Wrap Text</span>
          </label>
        </div>
        <div style={styles.preCon}>
          <pre className={preClass}>{content}</pre>
        </div>
      </div>
    </div>
  );
};

TextViewer.propTypes = {
  content: PropTypes.string.isRequired,
};

export default TextViewer;
