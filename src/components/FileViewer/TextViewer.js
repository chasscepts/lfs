import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ImageViewer, { SvgViewer } from './ImageViewer';
import IFrame, {WebPageViewer} from './IFrame';
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
    overflow: 'auto',
    padding: '25px',
  },
};

const toUrl = (text) => {
  const blob = new Blob([encoder.encode(text)]);
  return window.URL.createObjectURL(blob);
};

const SVGViewer = ({ content, path, name }) => {
  const [url, setUrl] = useState();

  useEffect(() => {
    const temp = toUrl(content);
    setUrl(temp);

    return () => window.URL.revokeObjectURL(temp);
  }, [content]);

  if (!url) return <></>;

  return <SvgViewer content={url} path={path} name={name} />
};

const SVGViewer2 = ({ content, path, name }) => <div>{content}</div>;

const IFrameAdapter = ({ content, path, name }) => {
  const [url, setUrl] = useState();

  useEffect(() => {
    const temp = toUrl(content);
    setUrl(temp);

    return () => window.URL.revokeObjectURL(temp);
  }, [content]);

  if (!url) return <></>;

  return <IFrame content={url} path={path} name={name} />
};

const fileHandlers = [
  { id: 1, displayName: 'Image Viewer', pattern: /\.svg$/i, Viewer: SvgViewer },
  { id: 2, displayName: 'Web Page Viewer', pattern: /\.m?htm?l?$/i, Viewer: WebPageViewer },
  { id: 3, displayName: 'JSON Viewer', pattern: /\.json$/i, Viewer: JsonViewer },
]

const TextViewer = ({ content, path, name }) => {
  const [wrap, setWrap] = useState(false);
  const [handlerId, setHandlerId] = useState('');
  const [handlers, setHandlers] = useState([]);
  const [selectedHandlerId, setSelectedHandlerId] = useState(null);

  const handleWrapChange = () => setWrap(!wrap);

  useEffect(() => {
    const handlers = fileHandlers.filter((fh) => path.match(fh.pattern));
    setHandlers(handlers);
    setHandlerId('');
  }, [path]);

  const useSelectedHandlerId = () => setHandlerId(selectedHandlerId);

  const clearHandlerId = () => setHandlerId('');

  const handleSelect = ({ target: { value } }) => setSelectedHandlerId(value);

  const preClass = wrap ? 'pre-wrap' : '';

  let Viewer;
  if (handlerId) {
    const handler = handlers.find((h) => h.id === +handlerId);
    if (handler) {
      Viewer = handler.Viewer;
    }
  }

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
        <div style={styles.preCon}>
          <pre className={preClass}>{content}</pre>
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
