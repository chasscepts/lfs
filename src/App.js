import React from 'react';
import { Provider } from 'react-redux';
import store from './app/store';

import './index.css';
import FileBrowser from './components/FileBrowser';
import FileViewer from './components/FileViewer';
import Notifications from './components/Notifications';

const App = () => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <>
          <FileBrowser />
          <FileViewer />
          <Notifications />
        </>
      </Provider>
    </React.StrictMode>
  );
};

export default App;
