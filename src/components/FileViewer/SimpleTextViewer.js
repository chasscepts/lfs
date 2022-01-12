import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TextDecoder as FastTextDecoder } from 'fastestsmallesttextencoderdecoder';
import LoadingBar from '../LoadingBar';
import { readObjectUrl } from '../../utility';
import ErrorView from './ErrorView';
const decoder = window.TextDecoder ? new TextDecoder() : new FastTextDecoder();

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#c7e1ef',
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
  preCon: {
    flex: 1,
    overflow: 'auto',
    padding: '25px',
  },
};

const SimpleTextViewer = ({ content }) => {
  const [state, setState] = useState({ isLoaded: false, text: '', error: '' });

  useEffect(() => {
    readObjectUrl(content, 'arraybuffer')
      .then((buffer) => setState({ isLoaded: true, error: '', text: decoder.decode(new Uint8Array(buffer)) }))
      .catch((err) => setState({
        isLoaded: true,
        text: '',
        error: err.message || 'An error occurred while openning file.',
      }));

    return () => URL.revokeObjectURL(content);
  }, [content]);

  if (!state.isLoaded) return <LoadingBar />

  if (state.error) return <ErrorView msg={state.error} />

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.preCon}>
          <pre className="pre-wrap">{state.text}</pre>
        </div>
      </div>
    </div>
  );
};

SimpleTextViewer.propTypes = {
  content: PropTypes.string.isRequired,
};

export default SimpleTextViewer;
