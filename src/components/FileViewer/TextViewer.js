import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Prism from 'prismjs';
import { SvgViewer } from './ImageViewer';
import {WebPageViewer} from './IFrame';
import JsonViewer from './JsonViewer';
import { TextEncoder as FastTextEncoder } from 'fastestsmallesttextencoderdecoder';
const encoder = window.TextEncoder ? new TextEncoder() : new FastTextEncoder();

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
    border: '1px solid #88a',
    borderRadius: '3px',
    padding: '2px',
    margin: '0 5px',
  },
  viewersSelect: {
    padding: '3px',
    border: '1px solid #ddd',
    outline: 'none',
  },
  openViewerBtn: {
    border: 'none',
    outline: 'none',
    padding: '4px 8px',
    backgroundColor: '#62b5e5',
    color: '#fff',
    cursor: 'pointer',
  },
  openViewerLabel: {
    padding: '4px 8px',
    backgroundColor: '#306a8b',
    color: '#fff',
  },
  clearViewer: {
    border: 'none',
    outline: 'none',
    padding: '4px 8px',
    backgroundColor: '#3c95c9',
    color: '#fff',
    cursor: 'pointer',
  },
  mx5: {
    marginLeft: '5px',
    marginRight: '5px',
  },
  preCon: {
    flex: 1,
    overflow: 'hidden',
    padding: '3px',
  },
};

const fileHandlers = [
  { id: 1, displayName: 'Image Viewer', pattern: /\.svg$/i, Viewer: SvgViewer },
  { id: 2, displayName: 'Web Page Viewer', pattern: /\.m?htm?l?$/i, Viewer: WebPageViewer },
  { id: 3, displayName: 'JSON Viewer', pattern: /\.json$/i, Viewer: JsonViewer },
]

/**
 * @param {string} name filename
 */
const getCodeLanguage = (name) => {
  const idx = name.lastIndexOf('.');
  if (idx < 0) return null;
  const ext = name.substring(idx + 1);

  switch(ext) {
    case 'js':
    case 'css':
    case 'php':
    case 'c':
    case 'cs':
    case 'cpp':
    case 'csv':
    case 'svg':
    case 'html':
    case 'xml':
    case 'py':
    case 'rb':
    case 'java':
    case 'ini':
    case 'md':
    case 'json':
      return `language-${ext}`;
    case 'jsx':
      return 'language-js';
    case 'htm':
      return 'language-html';
    default:
      return null;
  }
};

const TextViewer = ({ content, path, name }) => {
  const [wrap, setWrap] = useState(true);
  const [handlerId, setHandlerId] = useState('');
  const [handlers, setHandlers] = useState([]);
  const [selectedHandlerId, setSelectedHandlerId] = useState(null);
  const codeBlock = useRef(null);

  const handleWrapChange = () => setWrap(!wrap);

  useEffect(() => {
    const handlers = fileHandlers.filter((fh) => path.match(fh.pattern));
    setHandlers(handlers);
    setHandlerId('');
  }, [path]);

  useEffect(() => {
    if (codeBlock.current) {
      Prism.highlightElement(codeBlock.current);
    }
  }, [content, wrap, handlerId, handlers, selectedHandlerId]);

  const useSelectedHandlerId = () => setHandlerId(selectedHandlerId);

  const clearHandlerId = () => setHandlerId('');

  const handleSelect = ({ target: { value } }) => setSelectedHandlerId(value);

  let wrapStyle = null;
  let preStyle = {
    height: '100%',
    overflow: 'auto',
  };
  if (wrap) {
    wrapStyle = {
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    };

    preStyle = { ...preStyle, ...wrapStyle };
  }

  let Viewer;
  if (handlerId) {
    const handler = handlers.find((h) => h.id === +handlerId);
    if (handler) {
      Viewer = handler.Viewer;
    }
  }

  const lang = getCodeLanguage(name);

  const preConStyle = lang ? { ...styles.preCon, 
    backgroundColor: '#f5f2f0' } : styles.preCon;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.menuBar}>
          {!Viewer && (<label style={styles.menuItemWrap}>
            <input type="checkbox" checked={wrap} onChange={handleWrapChange} />
            <span style={styles.mx5}>Wrap Text</span>
          </label>)}
          {handlers.length > 0 && (
          <div style={styles.menuItemWrap}>
            <div style={styles.openViewerLabel}>View With</div>
            <select style={styles.viewersSelect} value={selectedHandlerId} onChange={handleSelect}>
              <option value="">-- Choose Viewer --</option>
              {handlers.map((h) => <option key={h.id} value={h.id}>{h.displayName}</option>)}
            </select>
            {selectedHandlerId && (
            <button style={styles.openViewerBtn} type="button" onClick={useSelectedHandlerId}>Open</button>)
            }
            {handlerId && (
            <button style={styles.clearViewer} type="button" onClick={clearHandlerId}>View Text</button>
            )}
          </div>
          )}
        </div>
        {Viewer && (
        <Viewer content={content} path={path} name={name} />
        )}
        {!Viewer && (
        <div style={preConStyle}>
          <pre style={preStyle}>
            {lang && (
              <code style={wrapStyle} className={lang} ref={codeBlock}>{content}</code>
            )}
            {!lang && content}
          </pre>
        </div>
        )}
      </div>
    </div>
  );
};

TextViewer.propTypes = {
  content: PropTypes.string.isRequired,
};

export default TextViewer;
