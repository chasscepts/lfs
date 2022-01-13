import React, { useEffect, useState } from 'react';
import { readObjectUrl } from '../../utility';
import LoadingBar from '../LoadingBar';
import ErrorView from './ErrorView';
import JsonViewer from './JsonViewer';

/**
 * @typedef Stream
 * @property {Uint8Array} buffer
 * @property {number} pos
*/

/**
 * @typedef ImageInfo
 * @property {boolean} isValid
 * @property {number} id
 * @property {number} width
 * @property {number} height
 * @property {number} colorCount
 * @property {number} colorPlanes
 * @property {number} bitsPerPixel
 * @property {number} xHotspot
 * @property {number} yHotSpot
 * @property {number} size
 * @property {number} offset
*/

/**
 * @typedef FileInfo
 * @property {boolean} isValid
 * @property {number} byteLength
 * @property {string} type
 * @property {number} imageCount
 * @property {Array<ImageInfo>} images
*/

const styles = {
  container: {
    display: 'flex',
  },
  img: (w, h) => ({
    width: `${w}px`,
    height: `${h}px`,
    margin: '0 15px',
    alignSelf: 'flex-start',
  }),
};

/**
 * @param {Uint8Array} view 
 * @returns {Stream}
 */
const newStream = (view) => {
  /**
   * @type {Stream}
   */
  const stream = Object.create(null);
  stream.buffer = view;
  stream.pos = 0;
  return stream;
};

/**
 * @param {Stream} stream
 */
const short = (stream) => {
  const buffer = stream.buffer;
  const pos = stream.pos;
  stream.pos += 2;
  return buffer[pos] | buffer[pos + 1] << 8;
};

/**
 * @param {Stream} stream
 */
const int = (stream) => {
  const buf = stream.buffer;
  const pos = stream.pos;
  stream.pos += 4;
  return buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24;
};

const intToLSB = (number) => [
  number & 0xFF,
  (number & 0xFF00) >> 8, 
  (number & 0xFF0000) >> 16, 
  (number & 0xFF000000) >> 24,
];

const imageTypes = {
  icon: 'Icon',
  cursor: 'Cursor',
};

/**
 * @param {ArrayBuffer} content 
 */
const parse = (content) => {
  const view = new Uint8Array(content);
  const stream = newStream(view);

  /**
   * @type {FileInfo}
   */
  const info = Object.create(null);
  info.isValid = true;
  info.byteLength = content.byteLength;

  const reserved = short(stream);
  if (reserved !== 0) {
    info.isValid = false;
    return info;
  }
  const type = short(stream);
  if (type === 1) {
    info.type = imageTypes.icon;
  } else if (type === 2) {
    info.type = imageTypes.cursor;
  } else {
    info.isValid = false;
    return info;
  }
  const count = short(stream);
  info.imageCount = count;
  let pos = stream.pos;

  /**
   * @type {Array<ImageInfo>}
   */
  const images = new Array(count);
  info.images = images;

  for (let i = 0; i < count; i += 1) {
    /**
     * @type {ImageInfo}
     */
    const img = Object.create(null);
    images[i] = img;
    img.id = i;
    img.width = view[pos++] || 256;
    img.height = view[pos++] || 256;
    img.colorCount = view[pos++] || 256;
    //  1 byte reserved field should be 0.
    stream.pos += 4;
    img.isValid = true;
    const x = short(stream);
    const y = short(stream);
    if (type === 1) {
      if (!(x === 0 || x === 1)) {
        img.isValid = false;
        continue;
      }
      img.colorPlanes = x;
      img.bitsPerPixel = y;
    } else {
      img.xHotspot = x;
      img.yHotSpot = y;
    }
    img.size = int(stream);
    img.offset = int(stream);
    const offset = img.offset;
    img.isPNG = true;

    const sigs = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < sigs.length; i += 1) {
      if (sigs[i] !== view[offset + i]) {
        img.isPNG = false;
        break;
      }
    }
  }

  return info;
};

const srcs = [];

/**
 * @param {Object} props
 * @param {ArrayBuffer} props.buffer
 * @param {ImageInfo} props.info
 */
const ImageViewer = ({ buffer, info }) => {
  if (!info.isValid) return <></>;
  const start = info.offset;
  const view = new Uint8Array(buffer, start);
  const data = new Uint8Array(14 + info.size);
  const size = info.size + 14;
  const header = [
    0x42, 0x4D,
    ...intToLSB(size),
    0, 0,
    0, 0,
  ];
  for (let i = 0; i < header.length; i += 1) {
    data[i] = header[i];
  }
  for (let i = 0; i < info.size; i += 1) {
    data[i + 14] = view[i];
  }
  // const buf = buffer.slice(start, start + info.size);
  const src = window.URL.createObjectURL(new Blob([data.buffer]));
  srcs.push(src);

  return (
    <img
      style={styles.img(info.width, info.height)}
      src={src}
      alt={info.id}
    />);
};

/**
 * @param {Object} props
 * @param {ArrayBuffer} props.content
 */
const IconViewer = ({ content }) => {
  const [buffer, setBuffer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    readObjectUrl(content, 'arraybuffer')
      .then((buffer) => {
        setBuffer(buffer);
      })
      .catch((err) => {
        setError(err.message || 'Sorry, we were unable to parse the selected file.');
      });
    return () => {
      window.URL.revokeObjectURL(content);
      while (true) {
        const src = srcs.pop();
        if (!src) break;
        window.URL.revokeObjectURL(src);
      }
    }
  }, [content]);

  if (error) return <ErrorView msg={error} />;

  if (!buffer) return <LoadingBar />;

  const fileInfo = parse(buffer);

  return <JsonViewer content={fileInfo} />

  // return (
  //   <div>
  //     {fileInfo.images.map((info) => (
  //     <ImageViewer key={info.id} buffer={buffer} info={info} />
  //     ))}
  //   </div>
  // );
};

export default IconViewer;
