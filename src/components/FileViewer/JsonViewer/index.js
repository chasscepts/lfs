import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import arrow from './arrow.png';
import { readObjectUrl } from '../../../utility';
import LoadingBar from '../../LoadingBar';
import ErrorView from '../ErrorView';
/* eslint-disable react/forbid-prop-types */

const colors = {
  string: { color: 'green' },
  number: { color: 'darkorange' },
  boolean: { color: 'blue' },
  function: { color: 'magenta' },
  null: { color: 'magenta' },
  key: { color: 'red' },
};

const styles = {
  wrapper: {
    width: '100%',
    height: '100%',
    padding: '15px 5px',
    overflow: 'auto',
  },
  container: {
    padding: '10px',
    height: '100%',
    overflow: 'auto',
  },
  keyRow: (depth) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    paddingLeft: `${10 + (depth * 16)}px`,
  }),
  close: (depth) => ({
    paddingLeft: `${10 + (depth * 16)}px`,
  }),
  btn: {
    position: 'absolute',
    left: '8px',
    top: '7px',
    padding: 0,
    display: 'block',
    width: '8px',
    height: '8px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  icon: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
  sep: {
    paddingRight: '8px',
  },
  collapsedContent: {
    height: '16px',
    padding: '0 2px',
  },
  children: (expanded) => ({
    display: expanded ? 'block' : 'none',
  }),
};

const hash = (param) => {
  const type = typeof param;
  if (type === 'boolean' || type === 'number' || type === 'undefined') {
    return param;
  }

  if (!param) {
    return param;
  }

  let str = param;
  if (type !== 'string') {
    try {
      str = JSON.stringify(param);
    } catch {
      return undefined;
    }
  }

  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }
  return hash;
};

function JsonRow({
  property, value, depth, root,
}) {
  const [expanded, setExpanded] = useState(true);

  const lType = typeof value;
  if (lType !== 'object') {
    let val = value;
    if (lType === 'function') {
      val = '[Func]';
    } else if (lType === 'string') {
      val = `"${val}"`;
    } else if (lType === 'boolean') {
      val = val ? 'true' : 'false';
    }
    return (
      <div style={styles.keyRow(depth + 1)}>
        {property && (
        <>
          <span style={colors.key}>{property}</span>
          <span style={styles.sep}>:</span>
        </>
        )}
        <span style={colors[lType]}>{val}</span>
        <span style={colors[lType]}>,</span>
      </div>
    );
  }

  if (!value) {
    if (property) {
      return (
        <div style={styles.keyRow(depth + 1)}>
          {property && <span style={colors.key}>{property}</span>}
          <span style={styles.sep}>:</span>
          <span style={colors.null}>Null</span>
          <span style={colors.null}>,</span>
        </div>
      );
    }
    return <div style={{ ...colors.null, padding: '15px' }}>Null</div>;
  }

  const toggleExpand = () => setExpanded(!expanded);

  const isArray = value instanceof Array;

  const bracket = isArray ? { open: '[', close: ']' } : { open: '{', close: '}' };

  const btnStyle = expanded ? { ...styles.btn, transform: 'rotate(90deg)' } : styles.btn;

  return (
    <>
      <div style={styles.keyRow(depth + 1)}>
        <button style={btnStyle} type="button" onClick={toggleExpand}>
          <img style={styles.icon} src={arrow} alt="arrow" />
        </button>
        {property && (
          <>
            <span style={colors.key}>{property}</span>
            <span style={styles.sep}>:</span>
          </>
        )}
        <span>{bracket.open}</span>
        {!expanded && (
          <>
            <span style={styles.collapsedContent}>&#x21D4;</span>
            <span>{bracket.close}</span>
            {!root && <span>,</span>}
          </>
        )}
      </div>
      <div style={styles.children(expanded)}>
        {isArray && value.map((val) => (
          <JsonRow key={`${hash(val)}`} value={val} depth={depth + 1} />
        ))}
        {!isArray && Object.keys(value).map((k) => (
          <JsonRow key={k} property={k} value={value[k]} depth={depth + 1} />
        ))}
      </div>
      {expanded && (
      <div style={styles.close(depth + 1)}>
        {bracket.close}
        {!root && <span>,</span>}
      </div>
      )}
    </>
  );
}

// JsonRow.propTypes = {
//   value: PropTypes.any,
//   property: PropTypes.string,
//   depth: PropTypes.number,
//   root: PropTypes.bool,
// };

// JsonRow.defaultProps = {
//   property: null,
//   depth: 0,
//   value: null,
//   root: false,
// };

function SimpleJsonViewer({ json }) {
  let obj = json;
  if (typeof json === 'string') {
    try {
      obj = JSON.parse(json);
    } catch {
      return <div>{json}</div>;
    }
  } else {
    try {
      JSON.stringify(json);
    } catch {
      //  We don't want to continue if this object contains circular reference
      return <></>;
    }
  }

  return <JsonRow value={obj} depth={0} root />;
}

const JsonViewer = ({ content }) => (
  <div style={styles.wrapper}><SimpleJsonViewer json={content} /></div>
);

export const JsonViewerAdapter = ({ content }) => {
  const [state, setState] = useState({ json: null, error: null });

  useEffect(() => {
    readObjectUrl(content, 'text')
      .then((text) => JSON.parse(text))
      .then((json) => setState({ json, error: null }))
      .catch((err) => setState({ json: null, error: err.message || 'An error occurred while reading data' }));

    return () => URL.revokeObjectURL(content);
  }, [content]);

  if (!(state.error || state.json)) return <LoadingBar />;

  if (state.json) return <JsonViewer content={state.json} />

  return <ErrorView msg={state.error} />
};

JsonViewerAdapter.propTypes = {
  content: PropTypes.string.isRequired,
};

export default JsonViewer;
