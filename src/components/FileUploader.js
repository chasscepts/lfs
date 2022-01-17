import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentDir, uploadFileAsync } from '../reducers/dirSlice';
import { openUploadForm, selectIsUploadFormOpen } from '../reducers/filesSlice';

const styles = {
  uploadInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    left: '-1000px',
  },
  uploadBtn: {
    color: '#fff',
    backgroundColor: '#62b5e5',
    border: 'none',
    outline: 'none',
    padding: '7px 15px',
    margin: '0 10px',
    borderRadius: '3px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  uploadFormCover: {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  uploadFormBody: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '5px',
    maxWidth: '450px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
    padding: '5px',
  },
};

/**
 * @typedef options
 * @property {string} filename
 * @property {boolean} fileClicked
 */

const FileUploader = () => {
  const [state, setStateReact] = useState({ file: null, fileClicked: false });
  const dir = useSelector(selectCurrentDir);
  const isOpen = useSelector(selectIsUploadFormOpen);
  const dispatch = useDispatch();

  const fileInput = useRef();
  const form = useRef();

  /**
   * @param {options} options
   */
  const setState = (options) => setStateReact({ ...state, ...options});

  const closeForm = () => {
    dispatch(openUploadForm(false));
  };

  const upload = (evt) => {
    evt.preventDefault();
    const { target } = evt;
    const { file } = target;
    if (!(file.files && file.files[0])) {
      // TODO: Give Feedback
      return;
    }
    const data = new FormData(form.current);
    dispatch(uploadFileAsync(data));
    closeForm();
  };

  const handleFileChange = ({ target }) => {
    setState({ file: target.files && target.files[0] });
  }

  useEffect(() => {
    if (isOpen && !state.fileClicked) {
      fileInput.current.click();
      setState({ fileClicked: true });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && state.file) {
      fileInput.current.value = '';
      setState({ file: null });
    }
  }, [isOpen]);

  const formClass = isOpen ? 'form' : 'form clip';
  
  return (
    <form ref={form} className={formClass} onSubmit={upload} method="POST" encType="multipart/form-data">
      <input type="hidden" name="path" value={dir.path} />
      <input
        style={styles.uploadInput}
        ref={fileInput}
        type="file"
        name="file"
        onChange={handleFileChange}
      />
      {state.file && (
      <div style={styles.uploadFormCover}>
        <div style={styles.uploadFormBody}>
          <div>Selected file {state.file.name} will be uploaded to {dir.path}</div>
          <div style={styles.controls}>
            <button style={styles.uploadBtn} type="button" onClick={closeForm}>Cancel</button>
            <button name="submit" style={styles.uploadBtn} type="submit">Upload</button>
          </div>
        </div>
      </div>
      )}
    </form>
  );
};

export default FileUploader;
