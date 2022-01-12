//  https://pkware.cachefly.net/webdocs/APPNOTE/APPNOTE-6.3.9.TXT
//  https://users.cs.jmu.edu/buchhofp/forensics/formats/pkzip.html

import React, { useEffect, useState } from 'react';
import { TextDecoder as FastTextDecoder } from 'fastestsmallesttextencoderdecoder';
import css from './style.module.css';
import { createObjectURLFromIntArray, fileSize, formatDate, readObjectUrl } from '../../../utility';
import inflate from '../../../utility/inflate';
import ErrorView from '../ErrorView';
import LoadingBar from '../../LoadingBar';
import ViewerChooser from '../ViewerChooser';
const decoder = window.TextDecoder ? new TextDecoder() : new FastTextDecoder();

/**
 * @typedef Size
 * @property {number} compressed
 * @property {number} uncompressed
*/

/**
 * @typedef Flag
 * @property {boolean} isEncrypted
 * @property {boolean} hasDataDescription
 * @property {number} implodeSlidingDictionary
 * @property {number} shanonFanoTreesCount
 * @property {number} deflateCompressionOption
 * @property {boolean} lzmaEOS
 * @property {boolean} compressedPatched
 * @property {boolean} strongEncryption
 * @property {boolean} utf8FilenameEncoding
 * @property {boolean} headerDataMasked
*/

/**
 * @typedef Version
 * @property {string} name
 * @property {number} number
*/

/**
 * @typedef FileHeader
 * @property {Version} encoderVersion
 * @property {Version} decoderVersion
 * @property {Flag} flag
 * @property {number} compression
 * @property {string} updated_time
 * @property {string} updated_date
 * @property {string} crc32
 * @property {Size} size
 * @property {number} uncompressedSize
 * @property {number} filenameLength
 * @property {number} extraFieldLength
 * @property {number} commentLength
 * @property {number} startDiskNumber
 * @property {number} internalAttributes
 * @property {number} externalAttributes
 * @property {number} localHeaderOffset
 * @property {string} filename
 * @property {function} extraField
 * @property {string} comment
 * @property {number} byteLength
*/

/**
 * @typedef File
 * @property {FileHeader} header
 * @property {boolean} isFile
 * @property {function} buffer
 * @property {function} text
*/

const gpbf = (lo, hi, compression) => {
  const isEncrypted = !!(lo & 0x01);
  let implodeSlidingDictionary;
  let shanonFanoTreesCount;
  let deflateCompressionOption;
  let lzmaEOS;
  if (compression === 6) {
    implodeSlidingDictionary = (lo & 0x02) ? 8000 : 4000;
    shanonFanoTreesCount = (lo & 0x03) ? 3 : 2;
  } else if (compression === 8) {
    deflateCompressionOption = (lo & 0x06) >> 1;
  } else if (compression === 14) {
    lzmaEOS = !!(lo & 0x02);
  }
  const hasDataDescription = !!(lo &  0x08);
  const compressedPatched = !!(lo & 0x20);
  const strongEncryption = !!(lo & 0x40);
  const utf8FilenameEncoding = !!(hi & 0x08);
  const headerDataMasked = !!(hi & 0x20);
  return {
    isEncrypted, hasDataDescription, implodeSlidingDictionary, shanonFanoTreesCount,
    deflateCompressionOption, lzmaEOS, compressedPatched, strongEncryption,
    utf8FilenameEncoding, headerDataMasked,
  };
}

const localrootSignature = '504b0304';

const LFS = [0x50, 0x4b, 0x03, 0x04];

const short = (low, high) => low | high << 8;

const int = (b0, b1, b2, b3) => b0 | b1 << 8 | b2 << 16 | b3 << 24;

const hex = (byte) => `0${byte.toString(16)}`.slice(-2).toLowerCase();

const hexString = (bytes) => bytes.map((b) => `0${b.toString(16)}`.slice(-2)).join('');

const dd = (num) => num < 10 ? `0${num}` : num;

const versions = (id) => {
  switch (id) {
    case 0:
      return `MS-DOS and OS/2`;
    case 1:
      return `Amiga`;
    case 2:
      return `OpenVMS`;
    case 3:
      return `UNIX`;
    case 4:
      return `VM/CMS`;
    case 5:
      return `Atari ST`;
    case 6:
      return `OS/2 H.P.F.S.`;
    case 7:
      return `Macintosh`;
    case 8:
      return `Z-System`;
    case 9:
      return `CP/M`;
    case 10:
      return `Windows NTFS`;
    case 11:
      return `MVS (OS/390 - Z/OS)`;
    case 12:
      return `VSE`;
    case 13:
      return `Acorn Risc`;
    case 14:
      return `VFAT`;
    case 15:
      return `alternate MVS`;
    case 16:
      return `BeOS`;
    case 17:
      return `Tandem`;
    case 18:
      return `OS/400`;
    case 19:
      return `OS/X (Darwin)`;
    default:
      return 'Unused';
  }
}

/**
 * Converts DOS time/date to a locale date string
 * @param {number} time
 * @param {number} date
 */
const dosTimeDateToDate = (time, date) => {
  const sec = (time & 0x1f) * 2;  /* Bits 0--4:  Secs divided by 2. */
  const min = (time & 0x07E0) & 0x3f; /* Bits 5--10: Minute. */
  const hour = (time >> 11);      /* Bits 11-15: Hour (0--23). */

  const day = (date & 0x1f);          /* Bits 0--4: Day (1--31). */
  const month = ((date >> 5) & 0xf) - 1; /* Bits 5--8: Month (1--12). */
  const year = (date >> 9) + 1980;       /* Bits 9--15: Year-1980. */

  return formatDate(new Date(year, month, day, hour, min, sec));
};

/**
 * @param {Uint8Array} view
 * @param {FileHeader} header
 */
const assertHeaderMatch = (view, header) => {
  let pointer = header.localHeaderOffset;

  // local file header signature     4 bytes  (0x04034b50)
  LFS.forEach((num) => {
    if (num !== view[pointer++]) {
      throw new Error('Offset does not point to local file header');
    }
  });

  // version needed to extract       2 bytes
  pointer += 2;

  // general purpose bit flag        2 bytes
  pointer += 2;

  // compression method              2 bytes
  const cm = short(view[pointer++], view[pointer++]);
  if (cm !== header.compression) {
    throw new Error(`Compression method does not match. [${header.compression}, ${cm}]`);
  }

  // last mod file time              2 bytes
  pointer += 2;

  // last mod file date              2 bytes
  pointer += 2;

  // crc-32                          4 bytes
  const crc32 = int(view[pointer++], view[pointer++], view[pointer++], view[pointer++]);
  if (crc32 !== header.crc32) {
    throw new Error(`CRC32 does not match. [${header.crc32}, ${crc32}]`);
  }

  // compressed size                 4 bytes
  const cSize = int(view[pointer++], view[pointer++], view[pointer++], view[pointer++]);
  if (cSize !== header.size.compressed) {
    throw new Error(`Compressed size does not match. [${header.size.compressed}, ${cSize}]`);
  }

  // uncompressed size               4 bytes
  const uSize = int(view[pointer++], view[pointer++], view[pointer++], view[pointer++]);
  if (uSize !== header.size.uncompressed) {
    throw new Error(`Uncompressed size does not match. [${header.size.uncompressed}, ${uSize}]`);
  }

  // file name length                2 bytes
  const nLen = short(view[pointer++], view[pointer++]);
  if (nLen !== header.filenameLength) {
    throw new Error(`Filename length does not match. [${header.filenameLength}, ${nLen}]`);
  }

  // extra field length              2 bytes
  const eLen = short(view[pointer++], view[pointer++]);
  //  console.log({ExtraField: { cen: header.extraFieldLength, loc: eLen }});
  if (eLen !== header.extraFieldLength) {
    // throw new Error(
    //   `Extra field length does not match. @{ cen: ${header.extraFieldLength}, loc: ${eLen} }`,
    // );
  }

  // const nBuf = new Array(nLen);
  // for (let i = 0; i < nLen; i += 1) {
  //   nBuf[i] = view[pointer++];
  // }

  // const filename = decoder.decode(new Uint8Array(nBuf));

  // console.log({ name_c: header.filename, name_l: filename });

  // file name (variable size)
  // extra field (variable size)
  return eLen;
};

/**
 * @param {ArrayBuffer} buffer
 * @param {FileHeader} header
 * @returns {File} file
 */
const prepareFile = (buffer, header) => {
  const view8 = new Uint8Array(buffer);
  const eLen = assertHeaderMatch(view8, header);

  const offset = header.localHeaderOffset + 30 + header.filenameLength + header.extraFieldLength;
  const length = header.size.uncompressed;
  let uncompressed;
  let text;
  const decompress = () => {
    switch(header.compression) {
      case 0:
        uncompressed = new Array(length);
        for (let i = 0; i < length; i += 1) {
          uncompressed[i] = view8[offset + i];
        }
        break;
      case 8:
        uncompressed = inflate(view8, offset);
        break;
      default:
        throw new Error('Compression method is not supported');
    }
  };

  return {
    header,
    isFile: true,
    path: header.filename,
    size: fileSize(length),
    compressionMethod: header.compression === 0 ? 'raw data' : 'deflate',
    encrypted: header.flag.isEncrypted ? true : false,
    locELen: eLen,
    buffer: () => new Promise((resolve) => {
      if (!uncompressed) {
        decompress();
      }
      resolve(uncompressed);
    }),
    text: () => new Promise((resolve) => {
      if (!text) {
        if (!uncompressed) {
          decompress();
        }
        text = decoder.decode(uncompressed);
      }
      resolve(text);
    }),
  };
};

const readFile = (buffer, cHeader) => {
  const view8 = new Uint8Array(buffer);

  let pointer = cHeader.localHeaderOffset;

  LFS.forEach((num) => {
    if (num !== view8[pointer++]) {
      throw new Error('Offset does not point to local file header');
    }
  });

  const read16 = () => short(view8[pointer++], view8[pointer++]);

  const read32 = () => int(view8[pointer++], view8[pointer++], view8[pointer++], view8[pointer++]);

  const header = Object.create(null);

  header.extractVersion = read16();
  header.flag = read16();
  header.method = read16();
  header.modificationTime = read16();
  header.modificationDate = read16();
  header.crc32 = read32();
  header.compressedSize = read32();
  header.uncompressedSize = read32();
  header.filenameLength = read16();
  header.extraFieldLength = read16();

  header.filename = (() => {
    const name = new Array(header.filenameLength);
    for (let i = 0; i < name.length; i += 1) {
      name[i] = view8[pointer++];
    }
    return decoder.decode(new Uint8Array(name));
  })();

  header.extraField = (() => {
    let buf;
    const length = header.extraFieldLength;
    const start = pointer;

    return () => {
      if (buf === undefined) {
        if (length <= 0) {
          buf = [];
        } else {
          buf = new Array(length);
          for (let i = 0; i < buf; i += 1) {
            buf[i] = view8[start + i];
          }
        }
      }
      return buf;
    }
  })();

  return {
    header,
    isFile: true,
    path: header.filename,
    size: fileSize(header.uncompressedSize),
    compressionMethod: header.method === 0 ? 'raw data' : 'deflate',
    encrypted: cHeader.flag.isEncrypted ? true : false,
    locELen: header.extraFieldLength,
    buffer: (() => {
      let buf;
      let start = pointer + header.extraFieldLength;
      return () => new Promise((resolve) => {
        if (buf === undefined) {
          buf = inflate(view8, start);
          console.log({headerLength: header.uncompressedSize, decodedLength: buf.length});
        }
        resolve(buf);
      });
    })(),
  };
}

const localHeader = (buffer, startPos) => {
  let start = startPos;
  let view8;
  let signature;
  const setSignature = () => {
    if (start + 4 > buffer.byteLength) return;
    view8 = new Uint8Array(buffer, start);
    const b0 = view8[start];
    const b1 = view8[start + 1];
    const b2 = view8[start + 2];
    const b3 = view8[start + 3];
    if (!(b0 && b1 && b2 && b3)) {
      signature = '';
    } else {
      signature = `${hex(b0)}${hex(b1)}${hex(b2)}${hex(b3)}`;
    }
  }
  setSignature();
  while (signature !== localrootSignature && start < buffer.byteLength - 30) {
    start += 1;
    setSignature();
  }
  if (signature !== localrootSignature) return null;

  console.log({signature, start});

  const flags = gpbf(view8[6], view8[7]);
  const compressedSize = int(view8[18], view8[19], view8[20], view8[21]);
  const uncompressedSize = int(view8[22], view8[23], view8[24], view8[25]);

  return {
    signature,
    version: short(view8[4], view8[5]),
    flags,
    compression: (() => {
      const compression = short(view8[8], view8[9]);
      console.log({compression});
      return compression;
    })(),
    updated_time: (() => {
      const hr = view8[10] >> 3;
      const min = (view8[10] & 0x7) | (view8[11] >> 5);
      const secs = view8[11] & 0x1F;

      return `${dd(hr)}:${dd(min)}:${dd(secs)}`;
    })(),
    update_date: (() => {
      const yr = view8[12] >> 1;
      const mth = (view8[12] & 0x1) | (view8[13] >> 5);
      const date = view8[12] & 0x1F;
      return `${yr}/${dd(mth)}/${dd(date)}`;
    })(),
    crc32: `0x${hex(view8[14])}${hex(view8[15])}${hex(view8[16])}${hex(view8[17])}`,
    compressedSize,
    uncompressedSize,
    ...(() => {
      const filenameLength = short(view8[26], view8[27]);
      const extraFieldLength = short(view8[28], view8[29]);
      const filename = decoder.decode(new Uint8Array(buffer, start + 30, filenameLength));
      let byteLength = 30 + filenameLength + extraFieldLength;

      let extraField = null;
      if (extraFieldLength > 0) {
        extraField = () => {
          let pointer = 30 + filenameLength;
          let read = 0;
          while (read < extraFieldLength) {
            const length = short(view8[pointer + 2], view8[pointer + 3]);
            read += 4 + length;
            if (read > extraFieldLength) break;
            const key = hexString([view8[pointer], view8[pointer + 1]]);
            pointer += 4;
            extraField[key] = new Uint8Array(buffer, pointer, length);
            read += length;
          }
        };
      }

      byteLength += compressedSize;
      if (flags.hasDataDescription) {
        byteLength += 12;
      }
  
      return { filenameLength, extraFieldLength, filename, byteLength, extraField };
    })(),
  }
  // local file header signature     4 bytes  (0x04034b50)
  // version needed to extract       2 bytes
  // general purpose bit flag        2 bytes
  // compression method              2 bytes
  // last mod file time              2 bytes
  // last mod file date              2 bytes
  // crc-32                          4 bytes
  // compressed size                 4 bytes
  // uncompressed size               4 bytes
  // file name length                2 bytes
  // extra field length              2 bytes

  // file name (variable size)
  // extra field (variable size)
};

const cdFileHeader = (buffer, start) => {
  const view8 = new Uint8Array(buffer, start);
  if (!(view8[0] === 80 && view8[1] === 75 && view8[2] === 1 && view8[3] === 2)) {
    console.log(hexString([
      view8[0], view8[1], view8[2], view8[3], view8[4], view8[5], view8[6],
    ]));
    throw new Error('Offset is not a valid file header signature');
  }

  let pos = 4;

  const read16 = () => short(view8[pos++], view8[pos++]);

  const read32 = () => int(view8[pos++], view8[pos++], view8[pos++], view8[pos++]);

  const encoderVersion = { number: (view8[pos++] / 10).toFixed(1), name: versions(view8[pos++]) };
  const decoderVersion = (read16() / 10).toFixed(1);
  const flagLOHI = [view8[pos++], view8[pos++]];
  const compression = read16();
  const flag = gpbf(flagLOHI[0], flagLOHI[1], compression);
  const modifiedTime = read16();
  const modifiedDate = read16();
  const crc32 = read32();
  const size = {
    compressed: read32(),
    uncompressed: read32(),
  };

  const filenameLength = read16();
  const extraFieldLength = read16();
  const commentLength = read16();
  const startDiskNumber = read16();
  const internalAttributes = read16();
  const externalAttributes = read32();
  const localHeaderOffset = read32();

  const filename = decoder.decode(new Uint8Array(buffer, start + pos, filenameLength));
  pos += filenameLength;

  let extraField = null;
  if (extraFieldLength > 0) {
    extraField = (() => {
      let pointer = pos;
      return  (map) => {
        let read = 0;
        while (read < extraFieldLength) {
          const length = short(view8[pointer + 2], view8[pointer + 3]);
          read += 4 + length;
          if (read > extraFieldLength) break;
          let key = hexString([view8[pointer], view8[pointer + 1]]);
          if (map) {
            key = map[key];
          }
          pointer += 4;
          extraField[key] = new Uint8Array(buffer, pointer, length);
          read += length;
        }
      };
    })();
  }

  pos += extraFieldLength;
  let comment = null;
  if (commentLength > 0) {
    comment = decoder.decode(new Uint8Array(buffer, start + pos, commentLength));
  }
  const byteLength = pos + commentLength;

  return {
    encoderVersion, decoderVersion, flag, compression, modifiedTime, modifiedDate, crc32,
    size, filenameLength, extraFieldLength, commentLength, startDiskNumber, internalAttributes, externalAttributes, localHeaderOffset, filename, extraField, comment, byteLength,
  };
}

const endOfCD = (buffer) => {
  //  const EOCDS = [80, 75, 5, 6]; //  END_OF_CENTRAL_DIRECTORY_SIGNATURE
  const view8 = new Uint8Array(buffer);
  let start = -1;
  let pos = buffer.byteLength - 22; //  End of central directory must be at least 22bytes long
  while (pos >= 0) {
    if (view8[pos] === 80 && view8[pos + 1] === 75 && view8[pos + 2] === 5 && view8[pos + 3] === 6) {
      start = pos + 4;
      break;
    }
    pos -= 1;
  }
  if (start < 0) return null;
  return {
    diskNumber: short(view8[start], view8[start + 1]),
    cdStartDiskNumber: short(view8[start + 2], view8[start + 3]),
    diskEntryCount: short(view8[start + 4], view8[start + 5]),
    totalEntryCount: short(view8[start + 6], view8[start + 7]),
    cdLength: int(view8[start + 8], view8[start + 9], view8[start + 10], view8[start + 11]),
    cdOffset: int(view8[start + 12], view8[start + 13], view8[start + 14], view8[start + 15]),
    ...(() => {
      const commentLength = short(view8[start + 16], view8[start + 17]);
      let comment = null;
      if (commentLength > 0) {
        comment = decoder.decode(new Uint8Array(buffer, start + 18, commentLength));
      }
      console.log({comment});
      return { commentLength, comment };
    })(),
  }
};

const unzip = (buffer) => {
  const endOfCDRecord = endOfCD(buffer);
  let pointer = endOfCDRecord.cdOffset;
  let counter = 0;
  const root = { isFile: false, name: 'root', path: '/', children: [] };

  /**
   * @param {File} file
   */
  root.add = (file) => {
    const filename = file.header.filename;
    const parts = filename.split('/');
    file.name = parts.pop();
    let object = root;
    let path = '';
    parts.forEach((dir) => {
      path = path ? `${path}/${dir}` : dir;
      let temp = object.children.find((f) => f.path === path);
      if (!temp) {
        temp = { isFile: false, path, children: [], name: dir };
        object.children.push(temp);
      }
      object = temp;
    });
    object.children.push(file);
  }

  root.get = (path) => {
    if (!path || path === '/') return root;
    const parts = path.split('/');
    let obj = root;
    let current = '';
    parts.forEach((name) => {
      current = current ? `${current}/${name}`: name;
      obj = obj.find((f) => f.path === current);
    });
    return obj;
  };

  /**
   * @param {File} file
   * @param {Array<string>} files
   */
  const tranverse = (file, files) => {
    if (file.isFile) {
      files.push(file.header.filename);
    } else {
      file.children.forEach((f) => {
        if (f.isFile !== undefined) {
          tranverse(f, files);
        }
      });
    }
  }

  root.files = () => {
    const files = [];
    tranverse(root, files);
    return files;
  };

  while (counter < endOfCDRecord.totalEntryCount) {
    const header = cdFileHeader(buffer, pointer);
    pointer += header.byteLength;
    counter += 1;
    const file = readFile(buffer, header);
    root.add(file);
  }

  return { endOfCDRecord, root };
};

const FileRow = ({ file, depth, selectedPath, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const isSelected = selectedPath === file.path;

  const pad = `${20 + (8 * depth)}px`;

  if (file.isFile) {
    const handleFileClick = () => onSelect(file);

    let fileClass = css.fileBtn;
    if (isSelected) {
      fileClass = `${fileClass} ${css.selected}`;
    }

    return (
      <button
        style={{ paddingLeft: pad }}
        className={fileClass}
        type="button"
        onClick={handleFileClick}
      >
        {file.name}
      </button>
    );
  }

  const handleExpandToggle = () => setExpanded(!expanded);

  let dirClass = css.dirBtn;
  if (expanded) {
    dirClass = `${dirClass} ${css.expanded}`;
  }

  return (
    <div>
      <button style={{ paddingLeft: pad }} className={dirClass} type="button" onClick={handleExpandToggle}>
        {file.name}
      </button>
      <div style={{ display: expanded ? 'block' : 'none' }}>
        {file.children.map((child) => (
          <FileRow
            key={child.path}
            file={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

const ZipViewer = ({ content }) => {
  const [root, setRoot] = useState();
  const [error, setError] = useState();
  const [selection, setSelection] = useState({ error: null, busy: false, file: null, url: null });

  useEffect(() => {
    readObjectUrl(content, 'arraybuffer')
      .then((buffer) => {
        const raw = unzip(buffer);
        setRoot(raw.root);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message || 'Sorry, we were unable to parse the selected file.');
      });
    return () => window.URL.revokeObjectURL(content);
  }, [content]);

  useEffect(() => {
    if (selection.busy || selection.error) return;
    if (selection.file && !selection.url) {
      setSelection({ ...selection, busy: true });
      selection.file.buffer()
        .then((buf) => {
          if (selection.url) {
            URL.revokeObjectURL(selection.url);
          }
          const url = createObjectURLFromIntArray(buf);
          setSelection({ ...selection, url, error: null, busy: false });
        })
        .catch((err) => {
          console.log(err);
          if (selection.url) {
            URL.revokeObjectURL(selection.url);
          }
          setSelection({
            ...selection,
            busy: false, url: null,
            error: err.message || 'Unable to uncompress file',
          });
        });
    }
  }, [selection]);

  if (error) return <ErrorView msg={error} />

  if (!root) return <LoadingBar />;

  const selectFile = (file) => {
    if (selection.busy) return;
    if (selection.file && selection.file.path === file.path) return;
    if (selection.url) {
      URL.revokeObjectURL(selection.url);
    }
    setSelection({ busy: false, url: null, error: null, file });
  }

  let modifiedDate = '';
  if (selection.file) {
    modifiedDate = dosTimeDateToDate(selection.file.header.modifiedTime, selection.file.header.modifiedDate);
  }

  return (
    <div className={css.container}>
      <div className={css.aside}>
        <div className={css.fileTree}>
          <FileRow
            file={root}
            depth={0}
            selectedPath={selection.file && selection.file.path}
            onSelect={selectFile}
          />
        </div>
        {selection.file && (
        <>
          <div className={css.fileInfoHeader}>File Info</div>
          <div className={css.fileInfo}>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Name</span>
              <span className={css.fileInfoValue} title={selection.file.name}>
                {selection.file.name}
              </span>
            </div>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Path</span>
              <span className={css.fileInfoValue} title={selection.file.path}>
                {selection.file.path}
              </span>
            </div>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Size</span>
              <span className={css.fileInfoValue}>
                {selection.file.size}
              </span>
            </div>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Last Modified</span>
              <span className={css.fileInfoValue} title={modifiedDate}>
                {modifiedDate}
              </span>
            </div>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Compression</span>
              <span className={css.fileInfoValue}>
                {selection.file.compressionMethod}
              </span>
            </div>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Encrypted</span>
              <span className={css.fileInfoValue}>
                {selection.file.encrypted ? 'True' : 'False'}
              </span>
            </div>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Version</span>
              <span className={css.fileInfoValue}>
                {selection.file.header.decoderVersion}
              </span>
            </div>
            <div className={css.fileInfoRow}>
              <span className={css.fileInfoLabel}>Extras Size</span>
              <span className={css.fileInfoValue}>
                {'{'} central: {selection.file.header.extraFieldLength}, local: {selection.file.locELen } {' }'}
              </span>
            </div>
          </div>
        </>
        )}
      </div>
      <div className={css.main}>
      {selection.error && <ErrorView msg={selection.error} />}
      {!selection.error && (<>
        {selection.busy && <LoadingBar />}
        {!selection.busy && selection.url && (
          <ViewerChooser url={selection.url} name={selection.file.name} />
        )}
      </>)}
      </div>
    </div>
  );
};

export default ZipViewer;
