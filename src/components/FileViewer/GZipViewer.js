import React, { useEffect, useState } from 'react';
import { TextDecoder as FastTextDecoder } from 'fastestsmallesttextencoderdecoder';
import { createObjectURLFromIntArray, fileSize, formatDate, readObjectUrl } from '../../utility';
import inflate from '../../utility/inflate';
import LoadingBar from '../LoadingBar';
import ViewerChooser from './ViewerChooser';
import ErrorView from './ErrorView';
const decoder = window.TextDecoder ? new TextDecoder() : new FastTextDecoder();

const styles = {
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  body: {
    padding: '0 15px 15px',
  },
  header: {
    borderRadius: '5px 5px 0 0',
    padding: '5px',
    color: '#fff',
    backgroundColor: '#1c92d2',
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    padding: '5px 0',
  },
  label: {
    width: '95px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  link: {
    outline: 'none',
    border: 'none',
    padding: '5px',
    color: 'blue',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

/**
 * @param {Uint8Array} buffer
 */
const decode = (buffer) => {
  let pos = 0;
  const readText = () => {
    const buf = [];
    let char = buffer[pos++];
    while(char) {
      buf.push(char);
      char = buffer[pos++];
    }
    return decoder.decode(new Uint8Array(buf));
  };

  if (buffer[0] !== 0x1F || buffer[1] !== 0x8B) {
    throw new Error(`Signature of file does not match gzip file. Expected: 31 139. Got: ${buffer[0]} ${buffer[1]}`);
  }
  const json = Object.create(null);
  const CM = buffer[2];
  json.compressionMethod = CM === 8 ? 'deflate' : `Reserved: ${CM}`;
  const flagByte = buffer[3];
  const flag = {
    FTEXT: flagByte & 0x01 ? true : false,
    FHCRC: flagByte & 0x02 ? true : false,
    FEXTRA: flagByte & 0x04 ? true : false,
    FNAME: flagByte & 0x08 ? true : false,
    FCOMMENT: flagByte & 0x10 ? true : false,
  };
  json.flag = flag;
  if (flag.FTEXT) {
    json.isAscii = true;
  };
  const MTIME = buffer[7] << 24 | buffer[6] << 16 | buffer[5] << 8 | buffer[4];
  if (MTIME) {
    json.modificationDate = formatDate(new Date(MTIME * 1000));
  }
  const XFL = buffer[8];
  if (json.compressionMethod === 'deflate') {
    json.compressionLevel = XFL === 4 ? 'Fast' : XFL === 2 ? 'Maximum' : `Unknown: ${XFL}`;
  }
  const oses = [
    'FAT filesystem (MS-DOS, OS/2, NT/Win32)', 'Amiga', 'VMS (or OpenVMS)', 'Unix',
    'VM/CMS', 'Atari TOS', 'HPFS filesystem (OS/2, NT)', 'Macintosh',
    'Z-System', 'CP/M', 'TOPS-20', 'NTFS filesystem (NT)',
    'QDOS', 'Acorn RISCOS'
  ];
  json.os = oses[buffer[9]] || 'Unknown';
  pos = 10;
  if (flag.FEXTRA) {
    const extraLength = buffer[pos++] | buffer[pos++] << 8;
    const start = pos;
    pos += extraLength;
    json.extra = decoder.decode(buffer.subarray(start, pos));
  }
  json.filename = flag.FNAME ? readText() : '';
  if (flag.FCOMMENT) {
    json.comment = readText();
  }
  if (flag.FHCRC) {
    pos += 2;
  }

  json.data = //*
    inflate(buffer, pos);
    //*/ decoder.decode(new Uint8Array(inflate(buffer, pos)));

  return json;
};

const GZipViewer = ({ content }) => {
  const [json, setJson] = useState();
  const [error, setError] = useState();
  const [url, setUrl] = useState();

  useEffect(() => {
    if (!json) {
      readObjectUrl(content, 'arraybuffer')
        .then((b) => {
          setJson(decode(new Uint8Array(b)));
        })
        .catch((err) => {
          console.log(err);
          setError(err.message || 'Application was unable to open this file');
        });
    }
    return () => {
      window.URL.revokeObjectURL(content);
    };
  }, [content]);

  const createUrl = () => {
    if (json) {
      const url = createObjectURLFromIntArray(json.data);
      setUrl(url);
    }
  };

  if (error) return <ErrorView msg={error} />

  if (!json) return <LoadingBar />;

  if (url === undefined) return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>File Properties</div>
        <div style={styles.body}>
          <div style={styles.row}>
            <div style={styles.label}>Filename: </div>
            <div>{json.filename}</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>Size: </div>
            <div>{fileSize(json.data.length)}</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>Date modified: </div>
            <div>{json.modificationDate}</div>
          </div>
          <div style={styles.controls}>
            <button style={styles.link} type="button" onClick={createUrl}>Open file with ...</button>
          </div>
        </div>
      </div>
    </div>
  );

  return <ViewerChooser url={url} name={json.filename} />;
}

export default GZipViewer;
