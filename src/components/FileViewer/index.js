import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { TextDecoder as FastTextDecoder } from 'fastestsmallesttextencoderdecoder';
import {
  loadFileContentAsync,
  selectActiveContentError,
  selectActiveFile,
  selectActiveFileContent,
  selectUseHexa,
  selectViewerLoading,
  selectWithViewerChooser,
  setActiveFile,
} from '../../reducers/filesSlice';
import css from './index.module.css';
import ErrorView from './ErrorView';
import LoadingBar from '../LoadingBar';
import TextViewer from './TextViewer';
import ImageViewer from './ImageViewer';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import ZipViewer from './ZipViewer.js';
import GZipViewer from './GZipViewer';
import IFrame from './IFrame';
import HexaViewer from './HexaViewer';
import ViewerChooser from './ViewerChooser';

const td = window.TextDecoder ? new TextDecoder() : new FastTextDecoder();

const textRegex = /\.txt$|\.log$|\.s?css$|\.sass$|\.less$|\.xml$|\.js$|\.json$|\.m?htm?l?$|\.svg$|\.md$|\.ini$|\.config$|\.properties$|\.csv$|\.cs$|\.php$/i;
const imageRegex = /\.png$|\.jpe?g$|\.gif/i;
const videoRegex = /\.mp4$|\.flv$|\.webv$|\.wmv$|\.mkv$|\.mov$|\.avi$/i;
const audioRegex = /\.mp3$|\.wav$|\.aac$|\.weba$|\.wma$|\.flac$|\.aiff?$/i;
const zipRegex = /\.docx$|\.zip$/i;
const gzRegex = /\.gz$/i;
const frameRegex = /\.pdf$|\.m?htm?l?$/i;

const findViwer = ({ path, name }) => {
  if (path.match(textRegex)) return { name, path, type: 'text', Viewer: TextViewer };
  if (path.match(imageRegex)) return { name, type: 'blob', Viewer: ImageViewer };
  if (path.match(videoRegex)) return { name, type: 'blob', Viewer: VideoPlayer };
  if (path.match(audioRegex)) return { name, type: 'blob', Viewer: AudioPlayer };
  if (path.match(zipRegex)) return { name, type: 'arraybuffer', Viewer: ZipViewer };
  if (path.match(gzRegex)) return { name, type: 'arraybuffer', Viewer: GZipViewer };
  if (path.match(frameRegex)) return { name, type: 'blob', Viewer: IFrame };
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

const DefaultViewer = ({ name, path, onClose, content }) => {
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

  return <TextViewer content={textContent.text} name={name} path={path} />;
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
  const useHexa = useSelector(selectUseHexa);
  const withViewerChooser = useSelector(selectWithViewerChooser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      if (viewer || withViewerChooser) {
        if (!(content || loading || error)) {
          const type = withViewerChooser ? 'arraybuffer' : viewer.type;
          dispatch(loadFileContentAsync(file.path, type));
        }
      } else {
        setViewer(findViwer(file));
      }
    } else if (viewer) {
      setViewer(null);
    }
  }, [file, content, loading, error, viewer, withViewerChooser]);

  if (!file) return <></>;

  if (!(viewer || withViewerChooser)) return <></>;

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

  if (loading) return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <LoadingBar />
    </Wrapper>
  );

  if (error) return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <ErrorView msg={error.message} />
    </Wrapper>
  );

  if (!content) return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <ErrorView msg="Something is not right. Waiting to auto recover ..." />
    </Wrapper>
  );

  if (useHexa) return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <HexaViewer content={content} name={name} path={file.path} />
    </Wrapper>
  );

  if (withViewerChooser) return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <ViewerChooser url={content} name={name} />
    </Wrapper>
  );

  const { Viewer, name } = viewer;

  if (Viewer) return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <Viewer content={content} name={name} path={file.path} />
    </Wrapper>
  );

  return (
    <Wrapper title={file.path} onClose={closeViewer}>
      <DefaultViewer name={file.name} path={file.path} onClose={closeViewer} content={content} />
    </Wrapper>
  );
};

export default FileViewer;
