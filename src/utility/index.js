export const readObjectUrl = (url, type) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = type;
  xhr.onerror = (err) => reject(err);
  xhr.onload = () => {
    if (xhr.status === 200) {
      try {
        resolve(type === 'text' ? xhr.responseText : xhr.response);
      } catch(err) {
        reject(err);
      }
    } else {
      reject(new Error('Unable to load url.'));
    }
  }
  xhr.send();
});

/**
 * @param {Array<number>} buffer 
 * @returns url
 */
export const createObjectURLFromIntArray = (buffer) => (
  URL.createObjectURL(new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' }))
);

export const fileSize = (bytes) => {
  if (bytes < 1000) return `${bytes}B`;
  if (bytes < 1000000) return `${Math.floor(bytes / 1000)}KB`;
  if (bytes < 1000000000) return `${Math.floor(bytes / 1000000)}MB`;
  if (bytes < 1000000000000) return `${Math.floor(bytes / 1000000000)}GB`;
  if (bytes < 1000000000000000) return `${Math.floor(bytes / 1000000000000)}TB`;
  return `${bytes}`;
}

/**
 * Standardize date format to use in application.
 * @param {Date} date
 */
export const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString("en-US", options);
}

/**
 * throw an error if condition is not met
 * @param {boolean} condition
 * @param {string} message
 */
export const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};
