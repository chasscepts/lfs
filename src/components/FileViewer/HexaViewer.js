import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUseHexa } from '../../reducers/filesSlice';
import { readObjectUrl } from '../../utility';

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '3px',
  },
  errorContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    padding: '3px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editor: {
    display: 'block',
    width: '100%',
    maxWidth: '820px',
    height: '100%',
    outline: 'none',
    border: '1px solid #ddd',
    overflow: 'auto',
    padding: '20px',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    resize: 'none',
  },
  error: {
    width: '350px',
    color: 'red',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
};

const MAX_DISPLAY_LENGTH = 5000000;

const HexaViewer = ({ content }) => {
  const [buffer, setBuffer] = useState();
  const [error, setError] = useState();
  const editor = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!buffer) {
      readObjectUrl(content, 'arraybuffer')
        .then((b) => {
          const length = b.byteLength;
          if (length > MAX_DISPLAY_LENGTH) {
            setError(`File size limit exceeded!<br />Current File Size: ${length}<br />Maximum File Size: ${MAX_DISPLAY_LENGTH}`);
          }
          setBuffer(
            [...(new Uint8Array(b))].map((n) => {
              if (n === 0) return '00';
              if (!n) return '--';
              return `0${n.toString(16)}`.slice(-2);
            }).join(' ')
          )
        })
        .catch((err) => {
          console.log(err);
          setError(err.message || 'Application was unable to open this file');
        });
    }
    return () => {
      window.URL.revokeObjectURL(content);
      dispatch(setUseHexa(false));
    };
  }, [content]);

  useEffect(() => {
    if(editor.current) {
      editor.current.innerHTML = buffer;
    }
  });

  if (!buffer) return <></>;

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.error}>{error}</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.editor} ref={editor} contentEditable />
    </div>
  );
}

export default HexaViewer;
