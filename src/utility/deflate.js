/**
 * @typedef Node
 * @property {number} value of this node. -1 if this is not a leaf node
 * @property {number} frequency how many times this node occurred in our data
 * @property {number} bitLength
 * @property {number} code
 * @property {Node} zero
 * @property {Node} one
*/

const newNode = (frequency, value = -1) => {
  /**
   * @type {Node}
   */
  const node = Object.create(null);
  node.value = value;
  node.frequecy = frequency;

  return node;
};

/**
 * @param {Node} node
 */
const assignBitLengths = (node) => {
  const length = node.bitLength;
  if (node.one) {
    node.one.bitLength = length + 1;
    assignBitLengths(node.one);
  }
  if (node.zero) {
    node.zero.bitLength = length + 1;
    assignBitLengths(node.zero);
  }
};

/**
 * @param {Array<Node>} table
 */
const huffmanCodes = (table) => {
  const store = [...table].sort((a, b) => b.frequency - a.frequency);

  while (store.length > 2) {
    const a = store.pop();
    const b = store.pop();
    const frequecy = a.frequecy + b.frequecy;
    const node = newNode(frequecy);
    node.one = a;
    node.zero = b;

    if (store.length === 0) {
      store.push(node);
      break;
    }

    if (store.length === 1) {
      store.push(node);
      continue;
    }

    let idx = store.length - 1;
    while (idx >= 0) {
      if (store[idx].frequecy >= frequecy) break;
      idx -= 1;
    }

    if (idx === 0) {
      store.unshift(node);
    } else if (idx === store.length - 1) {
      store.push(node);
    } else {
      store.splice(idx, 0, node);
    }
  }

  const root = store[0];
  root.bitLength = 1;
  assignBitLengths(root);

  //  assign codes
};
