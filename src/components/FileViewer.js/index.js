import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types'
import { TextDecoder as FastTextDecoder } from 'fastestsmallesttextencoderdecoder';
import {
  loadFileContentAsync,
  selectActiveContentError,
  selectActiveFile,
  selectActiveFileContent,
  selectViewerLoading,
  setActiveFile,
} from '../../reducers/filesSlice';
import css from './index.module.css';
import LoadingBar from '../LoadingBar';
import TextViewer from './TextViewer';

const td = window.TextDecoder ? new TextDecoder() : new FastTextDecoder();
const decode = td.decode;

const textRegex = /\.txt$|\.s?css$|\.xml$|\.js$|\.csv$|\.cs$|\.php$/i;

const findViwer = ({ path, name }) => {
  if (path.match(textRegex)) return { name, type: 'text', Viewer: TextViewer };
  return { type: 'arraybuffer' };
};

const Wrapper = ({ title, children, onClose }) => {
  return (
    <div className={css.container}>
      <header className={css.header}>
        <div className={css.headerTitle} title={title}>{title}</div>
        <button className={css.closeBtn} type="button" onClick={onClose} title="Close">X</button>
      </header>
      <div className={css.body}>{children}</div>
    </div>
  );
};

Wrapper.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.elementType,
  ]),
};

Wrapper.defaultProps = {
  children: null,
};

const ErrorView = ({ msg }) => {
  return (
    <div className={css.centerChild}>
      <div className={css.middleChild} style={{ padding: '40px' }}>
        <div className={css.errorText}>{msg}</div>
      </div>
    </div>
  );
};

ErrorView.propTypes = {
  msg: PropTypes.string.isRequired,
};

const UnSupportedTypePrompt = ({ name, viewAsText, onClose }) => {
  return (
    <div className={css.centerChild}>
      <div className={css.middleChild}>
        <div className={css.unsupportedText}>
          <div className={css.unsupportedPath}>{name}</div>
          <div>The format of the selected file is not yet supported.</div>
          <div>Will you like the application to open the file as a text file?</div>
        </div>
        <div className={css.controls}>
          <button className={`${css.btn} ${css.red}`} type="button" onClick={onClose}>Cancel</button>
          <button className={css.btn} type="button" onClick={viewAsText}>Open</button>
        </div>
      </div>
    </div>
  );
};

UnSupportedTypePrompt.propTypes = {
  name: PropTypes.string.isRequired,
  viewAsText: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const DefaultViewer = ({ name, onClose, content }) => {
  const [isTextMode, setTextMode] = useState(false);
  const [textContent, setTextContent] = useState({ text: '', isError: false });

  const openAsText = () => setTextMode(true);

  useEffect(() => {
    if (isTextMode) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', content);
      xhr.responseType = 'arraybuffer';
      xhr.onerror = (err) => {
        console.log(err);
        const text = err.message || 'Application encountered a fatal error while decoding file.';
        setTextContent({ isError: true, text });
      }
      xhr.onload = () => {
        if (xhr.status === 200) {
          setTextContent({ isError: false, text: td.decode(xhr.response) });
        } else {
          const txt = 'Application encountered a fatal error. This error was not caused by your machine. It is the programmers fault.';
          setTextContent({ isError: true, text: txt });
        }
      };
      xhr.send();
    }
  }, [isTextMode, content]);

  if (!isTextMode) return <UnSupportedTypePrompt name={name} viewAsText={openAsText} onClose={onClose} />

  if (textContent.isError) return <ErrorView msg={textContent.text} />

  return <TextViewer content={textContent.text} />;
};

DefaultViewer.propTypes = {
  name: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

const FileViewer = () => {
  const [viewer, setViewer] = useState(null);
  const file = useSelector(selectActiveFile);
  const content = useSelector(selectActiveFileContent);
  const loading = useSelector(selectViewerLoading);
  const error = useSelector(selectActiveContentError);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      if (viewer) {
        if (!(content || loading || error)) {
          dispatch(loadFileContentAsync(file.path, viewer.type));
        }
      } else {
        setViewer(findViwer(file));
      }
    } else if (viewer) {
      setViewer(null);
    }
  }, [file, content, loading, error, viewer]);

  if (!file) return <></>;

  if (!viewer) return <></>;

  const closeViewer = () => {
    if (viewer && viewer.type !== 'text') {
      try {
        window.URL.revokeObjectURL(content);
      } catch(err) {
        console.log(err);
      }
    }
    dispatch(setActiveFile(null));
  }

  if (loading) {
    return (
      <Wrapper title={file.path} onClose={closeViewer}>
        <LoadingBar />
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper title={file.path} onClose={closeViewer}>
        <ErrorView msg={error.message} />
      </Wrapper>
    );
  }

  if (!content) {
    return (
      <Wrapper title={file.path} onClose={closeViewer}>
        <ErrorView msg="Something is not right. Waiting to auto recover ..." />
      </Wrapper>
    );
  }

  const { Viewer, name } = viewer;

  if (Viewer) {
    console.log(content);
    return (
      <Wrapper title={file.path} onClose={closeViewer}>
        <Viewer content={content} name={name} />
    </Wrapper>
    );
  }

  return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <DefaultViewer name={file.name} onClose={closeViewer} content={content} />
    </Wrapper>
  );
};

export default FileViewer;
