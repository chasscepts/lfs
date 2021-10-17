import React from 'react';
import { Provider } from 'react-redux';
import store from './app/store';

import './index.css';
import FileBrowser from './components/FileBrowser';
import FileViewer from './components/FileViewer.js';

const App = () => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <>
          <FileBrowser />
          <FileViewer />
        </>
      </Provider>
    </React.StrictMode>
  );
};

export default App;
