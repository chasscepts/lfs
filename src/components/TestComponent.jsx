import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fixedInf } from '../utility/inflate';

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingTop: '28px',
  },
  body: {
    height: '100%',
    overflow: 'auto',
    borderTop: '1px solid #eee',
    padding: '10px',
  },
  closeBtn: {
    position: 'fixed',
    top: '5px',
    right: '5px',
    backgroundColor: 'transparent',
    color: 'red',
    fontSize: '18px',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  file: {
    position: 'fixed',
    top: '3px',
    left: '10px',
  },
  areasWrap: {
    height: '100%',
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  area: {
    flex: 1,
    padding: '20px',
    resize: 'none',
    border: '1px solid #ddd',
    outline: 'none',
  },
};

const Component = ({ close }) => {
  const [text, setText] = useState({ t1: '', t2: '' });

  useEffect(() => {
    const arr = fixedInf();
    console.log(arr);
    const t2 = arr.join('\n');
    setText({ t2, t1: '' });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.body}>
        <div style={styles.areasWrap}>
          <textarea style={styles.area} value={text.t1} />
          <textarea style={styles.area} value={text.t2} />
        </div>
      </div>
      <button style={styles.closeBtn} type="button" onClick={close}>X</button>
    </div>
  );
}

const Component1 = ({ close }) => {
  const [text, setText] = useState('');

  const readFile = ({ target }) => {
    const file = target.files && target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(reader.result);
    reader.readAsText(file);
  };

  return (
    <div style={styles.container}>
      <div style={styles.body}>
        {text}
      </div>
      <input style={styles.file} type="file" onChange={readFile} />
      <button style={styles.closeBtn} type="button" onClick={close}>X</button>
    </div>
  );
}

Component.propTypes = {
  close: PropTypes.func.isRequired,
};

export default Component;
