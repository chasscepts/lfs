const normalizeError = (err) => {
  if (!err) {
    return { message: 'An unknown error encountered. Please try again.' };
  }
  if (err.response) {
    return { message: err.response.data.message || JSON.stringify(err.response.data) };
  }
  if (err.request) {
    return { message: 'Server is not responding. One possibility is that CORS is disabled on server. Check your console to see' };
  }
  if (err.message) {
    return { message: err.message };
  }
  if (typeof err === 'string') {
    return { message: err };
  }
  return { message: 'An unknown error encountered. Please try again.' };
};

/**
 * 
 * @param {string} url 
 * @returns
 */
 const fetcher = (url, options = { responseType: '' }) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  if (options && options.responseType) {
    xhr.responseType = options.responseType;
  }
  xhr.open('GET', url);
  xhr.onerror = (evt) => reject(evt);
  xhr.onload = () => {
    if (xhr.status === 200) {
      resolve({
        body: () => Promise.resolve(xhr.response),
        text: () => new Promise((res, rej) => {
          try {
            res(xhr.responseText);
          } catch(err) {
            rej(err);
          }
        }),
        json: () => new Promise((res, rej) => {
          try {
            const temp = JSON.parse(xhr.response);
            res(temp);
          } catch {
            rej(new Error('Response is not a valid JSON Object'));
          }
        }),
      })
    } else {
      reject({ message: `Server responded with status code ${xhr.status}.\n Reason: ${xhr.statusText}` });
    }
  };
  xhr.send();
});

/**
 * @param {string} url path
 * @param {FormData} formData 
 */
const upload = (url, formData) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.onerror = () => reject({ message: 'Network error. Your request could not be completed' });
  xhr.onload = () => {
    if (xhr.status === 200) {
      resolve({
        body: () => Promise.resolve(xhr.response),
        text: () => new Promise((res, rej) => {
          try {
            res(xhr.responseText);
          } catch(err) {
            rej(err);
          }
        }),
        json: () => new Promise((res, rej) => {
          try {
            const temp = JSON.parse(xhr.response);
            res(temp);
          } catch {
            rej(new Error('Response is not a valid JSON Object'));
          }
        }),
      })
    } else {
      reject(new Error(`Server responded with status code ${xhr.status}.\n Reason: ${xhr.statusText}`));
    }
  };
  xhr.send(formData);
});

const downloadFile = (path) => new Promise((resolve, reject) => {
  fetcher(`/download?path=${path}`, { responseType: 'blob' })
  .then((res) => res.body())
  .then((data) => {
    if (typeof window.navigator.msSaveBlob === 'function') {
      window.navigator.msSaveBlob(data, name);
    } else {
      var blob = data;
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = name;
      document.body.append(link);
      link.click();
      link.remove();
    }
    resolve();
  })
  .catch((err) => reject(normalizeError(err)));
});

const listDir = (path) => new Promise((resolve, reject) => {
  let url = '/list-dir';
  if (path) {
    url = `${url}?path=${path}`;
  }
  fetcher(url)
    .then((res) => res.json())
    .then((json) => {
      resolve(json);
    })
    .catch((err) => reject(err));
});

export default {
  upload,
  downloadFile,
  listDir,
};
