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
    }
  };
  xhr.send(formData);
});

let root;

const downloadFile = (path, name) => {
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
  })
  .catch((err) => console.log(err));
};

const listDir = (path) => new Promise((resolve, reject) => {
  let url = '/list-dir';
  if (path) {
    url = `${url}?path=${path}`;
  }
  fetcher(url)
    .then((res) => res.json())
    .then((json) => {
      if (!path) {
        root = json;
      }
      resolve(json);
    })
    .catch((err) => reject(err));
});

export default {
  upload,
  downloadFile,
  listDir,
  root: () => root,
};
