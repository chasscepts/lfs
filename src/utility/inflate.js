//  https://www.ietf.org/rfc/rfc1951.txt
//  https://www.infinitepartitions.com/art001.html
//  https://www.hanshq.net/zip.html

import { assert } from '.';

/**
 * @typedef Node
 * @property {Node} zero
 * @property {Node} one
 * @property {number} code
*/

/**
 * @typedef Range
 * @property {number} end
 * @property {number} bitLength
*/

/**
 * @typedef Stream
 * @property {function} nextBit
 * @property {function} readNextBytes
 * @property {function} readNextShort
 * @property {function} readBitsInv
 * @property {function} readNextValue
*/

/**
 * @typedef LookupTable
 * @property {Array<{}>} primary
*/

/**
 * @typedef
 * @property {number} end
 * @property {number} bitLength
*/

const print = (node, label, result) => {
  if (!node) return;
  if (node.code !== -1) {
    result.push(`${node.code}: ${label}`);
    return;
  }
  print(node.zero, `${label}0`, result);
  print(node.one, `${label}1`, result);
};

const STOP_CODE = 256;

const CODE_LENGTHS_ORDER = [
  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
];

const LENGTH_OFFSETS = [
  11, 13, 15, 17, 19, 23, 27,
  31, 35, 43, 51, 59, 67, 83,
  99, 115, 131, 163, 195, 227
];

const DISTANCE_OFFSETS = [
  4, 6, 8, 12, 16, 24, 32, 48,
  64, 96, 128, 192, 256, 384,
  512, 768, 1024, 1536, 2048,
  3072, 4096, 6144, 8192,
  12288, 16384, 24576
];

/**
 * masks upper bits of 32 bit number
 */
const BITS_MASKS_UPPER = [
  0,
  0x80000000, 0xC0000000, 0xE0000000, 0xF0000000, 0xF8000000, 0xFC000000, 0xFE000000, 0xFF000000,
  0xFF800000, 0xFFC00000, 0xFFE00000, 0xFFF00000, 0xFFF80000, 0xFFFC0000, 0xFFFE0000, 0xFFFF0000,
  0xFFFF8000, 0xFFFFC000, 0xFFFFE000, 0xFFFFF000, 0xFFFFF800, 0xFFFFFC00, 0xFFFFFE00, 0xFFFFFF00,
  0xFFFFFF80, 0xFFFFFFC0, 0xFFFFFFE0, 0xFFFFFFF0, 0xFFFFFFF8, 0xFFFFFFFC, 0xFFFFFFFE, 0xFFFFFFFF,
];

const BITS_MASKS_LOWER = [
  0,
  0x1, 0x3, 0x7, 0xF, 0x1F, 0x3F, 0x7F, 0xFF,
  0x1FF, 0x3FF, 0x7FF, 0xFFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF,
  0x1FFFF, 0x3FFFF, 0x7FFFF, 0xFFFFF, 0x1FFFFF, 0x3FFFFF, 0x7FFFFF, 0xFFFFFF,
  0x1FFFFFF, 0x3FFFF, 0x7FFFFFF, 0xFFFFFFF, 0x1FFFFFFF, 0x3FFFFFFF, 0x7FFFFFFF, 0xFFFFFFFF,
]

const newNode = (code = -1) => {
  /**
   * @type {Node}
   */
  const node = Object.create(null);
  node.code = code;
  return node;
};

const newRange = (end, bitLength) => {
  /**
   * @type {Range}
   */
  const range = Object.create(null);
  range.end = end;
  range.bitLength = bitLength;

  return range;
};

/**
 * @param {Array<number>} lengths
 */
const buildHuffmanTree = (lengths) => {
  const length = lengths.length;
  let maxBitLength = 0;

  for (let i = 0; i < length; i += 1) {
    if (lengths[i] > maxBitLength) {
      maxBitLength = lengths[i];
    }
  }

  const ranges = Array(maxBitLength + 1);
  for (let i = 0; i < length; i += 1) {
    if (lengths[i]) {
      let range = ranges[lengths[i]];
      if (!range) {
        range = [];
        ranges[lengths[i]] = range;
      }
      range.push(i);
    }
  }

  const root = newNode();
  let code = 0;
  let temp;
  for (let i = 1; i <= maxBitLength; i += 1) {
    const range = ranges[i];

    if (range) {
      for (let j = 0; j < range.length; j += 1) {
        let node = root;
        let mask = Math.pow(2, i - 1);
        while (mask > 1) {
          if (code & mask) {
            temp = node.one;
            if (!temp) {
              temp = newNode();
              node.one = temp;
            }
          } else {
            temp = node.zero;
            if (!temp) {
              temp = newNode();
              node.zero = temp;
            }
          }
          node = temp;
          mask >>= 1;
        }
        if (code & 1) {
          node.one = newNode(range[j]);
        } else {
          node.zero = newNode(range[j]);
        }
        code += 1;
      }
      code <<= 1;
    }
  }
  
  return root;
}

/**
 * @param {Array<Range>} ranges
 * @param {number} length
 */
const buildHuffmanTree2 = (ranges, length) => {
  console.log({length, ranges});
  let maxBitLength = 0;
  for (let i = 0; i < length; i += 1) {
    if (ranges[i].bitLength > maxBitLength) {
      maxBitLength = ranges[i].bitLength;
    }
  }

  const blCount = Array(maxBitLength + 1).fill(0);
  const nextCode = Array(maxBitLength).fill(0);
  const tree = Array(ranges[length - 1].end + 1);

  for (let i = 0; i < length; i += 1) {
    blCount[ranges[i].bitLength] += ranges[i].end - ((i > 0) ? ranges[i - 1].end : -1);
  }

  let code = 0;
  for (let i = 1; i <= maxBitLength; i += 1) {
    code = (code + blCount[i - 1]) << 1;
    if (blCount[i]) {
      nextCode[i] = code;
    }
  }

  let activeRange = 0;
  for (let n = 0; n <= ranges[length - 1].end; n += 1) {
    if (n > ranges[activeRange].end) {
      activeRange += 1;
    }
    if (ranges[activeRange]) {
      let node = tree[n];
      if (!node) {
        node = Object.create(null);
        tree[n] = node;
      }
      node.len = ranges[activeRange].bitLength;
      if (node.len !== 0) {
        node.code = nextCode[node.len];
        nextCode[node.len] += 1;
      }
    }
  }

  const root = newNode();

  for ( let n = 0; n <= ranges[length - 1].end; n += 1) {
    let node = root;
    if (tree[n] && tree[n].len) {
      for (let bits = tree[n].len; bits > 0; bits -= 1) {
        if (tree[n].code & (1 << (bits - 1))) {
          if (!node.one) {
            node.one = newNode();
          }
          node = node.one;
        } else {
          if (!node.zero) {
            node.zero = newNode();
          }
          node = node.zero;
        }
      }
      node.code = n;
    }
  }

  return root;
};


const getCode = (bits, table) => {

};

const fixedLitRoot = (() => {
  const table = new Array(288);
  const pushRange = (start, end, length) => {
    for (let i = start; i <= end; i += 1) {
      table[i] = length;
    }
  };

  pushRange(0, 143, 8);
  pushRange(144, 255, 9);
  pushRange(256, 279, 7);
  pushRange(280, 287, 8);

  return buildHuffmanTree(table);
})();

export const fixedInf = () => {
  const rslt = [];
  print(fixedLitRoot, '', rslt);
  return rslt;
};

// 0 - 143     8          00110000 through 10111111
// 144 - 255   9          110010000 through 111111111
// 256 - 279   7          0000000 through 0010111
// 280 - 287   8          11000000 through 11000111

const fixedLitRoot2 = [

];

/**
 * @param {Stream} stream
 */
const readDynamicHuffmanTree = (stream) => {
  const hlit = stream.readBitsInv(5);
  const hdist = stream.readBitsInv(5);
  const hclen = stream.readBitsInv(4);

  const codeLengths = new Array(19);

  let i = 0;

  for (i = 0; i < hclen + 4; i += 1) {
    codeLengths[CODE_LENGTHS_ORDER[i]] = stream.readBitsInv(3);
  }

  const root = buildHuffmanTree(codeLengths);

  let node = root;
  const length = 258 + hlit + hdist;
  const distStart = hlit + 257;
  const alphabets = new Array(length);
  let code;
  let repeatLength;
  let repeatCode;
  i = 0;

  while (i < length) {
    if (stream.nextBit()) {
      node = node.one;
    } else {
      node = node.zero;
    }

    if (!node) {
      const p = [];
      print(root, '', p);
      console.log(p);
    }

    code = node.code;

    if (code != -1) {
      if (code > 15) {
        switch (node.code) {
          case 16:
            repeatLength = stream.readBitsInv(2) + 3;
            repeatCode = alphabets[i - 1];
            break;
          case 17:
            repeatLength = stream.readBitsInv(3) + 3;
            repeatCode = 0;
            break;
          case 18:
            repeatLength = stream.readBitsInv(7) + 11;
            repeatCode = 0;
            break;
        }

        while (repeatLength) {
          alphabets[i] = repeatCode;
          repeatLength -= 1;
          i += 1;
        }
      } else {
        alphabets[i] = code;
        i += 1;
      }

      node = root;
    }
  }

  const litAlphabets = alphabets.slice(0, distStart);
  const litRoot = buildHuffmanTree(litAlphabets);
  const distAlphabets = alphabets.slice(distStart, length);
  const distRoot = buildHuffmanTree(distAlphabets);
  return [litRoot, distRoot];
};

/**
 * @param {Array<number>} lengths
 */
const createRange = (lengths) => {
  const length = lengths.length;

  /**
   * @type {Array<Range}
   */
  const codeLengthRanges = new Array(length);

  let j = 0;
  for (let i = 0; i < length; i += 1) {
    if (i > 0 && lengths[i] !== lengths[i - 1]) {
      j += 1;
    }
    const range = codeLengthRanges[j];
    if (range) {
      range.end = i;
    } else {
      codeLengthRanges[j] =newRange(i, lengths[i]);
    }
  }

  return [codeLengthRanges, j + 1];
};

/**
 * @param {Stream} stream
 */
const readDynamicHuffmanTree2 = (stream) => {
  const hlit = stream.readBitsInv(5);
  const hdist = stream.readBitsInv(5);
  const hclen = stream.readBitsInv(4);

  const code_length_offsets = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  const code_lengths = new Array(19);
  const code_length_ranges = new Array(19);

  let i = 0;

  for (i = 0; i < (hclen + 4); i += 1) {
    code_lengths[code_length_offsets[i]] = stream.readBitsInv(3);
  }
  
  let j = 0;
  for (i = 0; i < 19; i += 1) {
    if (i > 0  && (code_lengths[i] != code_lengths[i - 1 ])) {
      j += 1;
    }
    code_length_ranges[j] = newRange(i, code_lengths[i]);
  }

  const code_lengths_root = buildHuffmanTree2(code_length_ranges, j + 1);

  const litLength = hlit + 257;
  const alphabetLength = litLength + hdist + 1;
  const alphabet = new Array(alphabetLength);
  const alphabet_ranges = new Array(alphabetLength);
  
  let code_lengths_node = code_lengths_root;
  i = 0;

  while (i < alphabetLength) {
    if (stream.nextBit()) {
      code_lengths_node = code_lengths_node.one;
    }
    else {
      code_lengths_node = code_lengths_node.zero;
    }
    if (code_lengths_node.code !== -1) {
      if (code_lengths_node.code > 15) {
        let repeat_length = 0;
        switch (code_lengths_node.code) {
          case 16:
            repeat_length = stream.readBitsInv(2) + 3;
            break;
          case 17:
            repeat_length = stream.readBitsInv(3) + 3;
            break;
          case 18:
            repeat_length = stream.readBitsInv(7) + 11;
            break;
        }
        while (repeat_length) {
          if (code_lengths_node.code === 16) {
            alphabet[i] = alphabet[i - 1];
          } else {
            alphabet[i] = 0;
          }
          i += 1;
          repeat_length -= 1;
        }
      }
      else {
        alphabet[i] = code_lengths_node.code;
        i += 1;
      }
      code_lengths_node = code_lengths_root;
    }
  }

  j = 0;
  for (i = 0; i <= litLength; i += 1) {
    if (i > 0 && (alphabet[i] != alphabet[i - 1])) {
      j += 1;
    }

    alphabet_ranges[j] = newRange(i, alphabet[i]);
  }

  const literals_root = buildHuffmanTree2(alphabet_ranges, j);

  i -= 1;
  j = 0;
  for ( ; i <= alphabetLength; i += 1) {
    if (i > litLength && alphabet[i] !== alphabet[i - 1]) {
      j += 1;
    }

    alphabet_ranges[j] = newRange(i - litLength, alphabet[i]);
  }

  const distances_root = buildHuffmanTree2(alphabet_ranges, j);

  return [literals_root, distances_root];
};

/**
 * @param {Uint8Array} buffer compressed data.
 * @param {number} start offset into buffer to start reading from.
 */
const inflate = (buffer, start) => {
  /**
   * @type {Array<number>}
   */
  let output = [];

  const stream = (() => {
    let pos = start;
    let mask = 1;
    let buf = buffer[pos++];
  
    const nextBit = () => {
      const bit = (buf & mask) ? 1 : 0;
      mask <<= 1;
      if (mask === 256) {
        if (pos >= buffer.length) {
          throw new Error('End of buffer exceeded!');
        }
        mask = 1;
        buf = buffer[pos++];
      }
      return bit;
    };
  
    const readBitsInv = (count) => {
      let bitsValue = 0;
      for (let i = 0; i < count; i += 1) {
        const bit = nextBit();
        bitsValue |= (bit << i);
      }
      return bitsValue;
    };

    const readNextBytes = (count) => {
      let pointer = pos;
      if (pos > buffer.length) {
        throw new Error('Cannot read beyond the end of stream');
      }
      pos += count;
      mask = 1;
      while (pointer < pos) {
        output.push(buffer[pointer++]);
      }
      buf = buffer[pos++];
    };

    const readNextShort = () => {
      const num = mask === 1 ? buf | buffer[pos++] << 8 : buffer[pos++] | buffer[pos++] << 8;
      mask = 1;
      buf = buffer[pos++];
      return num;
    };

    /**
     * @param {Node} root 
     */
    const readNextValue = (root) => {
      let node = root;
      while (node.code === -1) {
        node = nextBit() ? node.one : node.zero;
      }
      if (!node) return STOP_CODE;
      return node.code;
    };

    return {
      nextBit,
      readBitsInv,
      readNextBytes,
      readNextShort,
      readNextValue,
    }
  })();

  let isFinalBlock;
  let blockType;

  do {
    isFinalBlock = !!(stream.nextBit());
    blockType = stream.readBitsInv(2);

    if (blockType === 3) throw new Error('Invalid Block Type: Cannot process compressed block of type 3');

    if (blockType === 0) {
      const blockLength = stream.readNextShort();
      stream.readNextShort(); // one's complement of blockLength
      stream.readNextBytes(blockLength, output);
      continue;
    }

    /**
     * @type {Node}
     */
    let litRoot;

    /**
     * @type {function}
     */
    let readDistance;

    if (blockType === 1) {
      litRoot = fixedLitRoot;
      readDistance = () => stream.readNextBytes(5);
    } else {
      /**
       * @type {Node}
       */
      let distRoot;
      [litRoot, distRoot] = readDynamicHuffmanTree(stream);
      readDistance = () => stream.readNextValue(distRoot);
    }

    while (true) {
      let value = stream.readNextValue(litRoot);
      if (value === STOP_CODE) break;
      if (value < STOP_CODE) {
        output.push(value);
        continue;
      }

      let length;
      
      if (value < 265) {
        length = value - 254;
      } else if (value < 285) {
        length = stream.readBitsInv(Math.floor((value - 261) / 4)) + LENGTH_OFFSETS[value - 265];
      } else {
        length = 258;
      }

      let distance;
      distance = readDistance();
      if (distance > 3) {
        distance = stream.readBitsInv(Math.floor((distance - 2) / 2)) + DISTANCE_OFFSETS[distance - 4];
      } else {
        distance += 1;
      }

      const start = output.length - distance - 1;
      if (start < 0) {
        throw new Error('Inflate: cannot copy beyond the start of output buffer!');
      } else if (start >= output.length) {
        throw new Error('Inflate: cannot copy beyond the end of output buffer!');
      }
      for (let i = 0; i < length; i += 1) {
        output.push(output[start + i]);
      }
    }
  } while (!isFinalBlock);
  return output;
};


const initializeHuffmanTable = (stream) => {

};

/**
 * @param {Uint8Array} data compressed data.
 * @param {number} start offset into buffer to start reading from.
 */
const inflate2 = (data, start) => {
  /**
   * @type {Array<number>}
   */
  let output = [];

  const stream = (() => {
    const MIN_BUF_BITS_LENGTH = 18;
    const MAX_BUF_BITS_LENGTH = 32;

    let bytePosition = start;
    let bufBitsLength = MAX_BUF_BITS_LENGTH;
    let buffer = data[bytePosition++];
    for (let i = 0; i < 3; i += 1) {
      buffer <<= 8;
      buffer |= data[bytePosition++];
    }

    /**
     * @param {number} count number of bits to return
     */
    const nextBits = (count) => {
      bufBitsLength -= count;
      const bits = (buffer & BITS_MASKS_UPPER[count]) >> bufBitsLength;
      buffer &= BITS_MASKS_LOWER[bufBitsLength];
      if (bufBitsLength < MIN_BUF_BITS_LENGTH) {
        assert(bytePosition < data.length, 'Cannot access beyond the input buffer');
        buffer <<= 8;
        buffer |= data[bytePosition++];
      }
      return bits;
    };

    return {
      buffer: () => buffer,
      nextBits
    }

  })();

  let isFinalBlock;
  let blockType;
};

export default inflate;
