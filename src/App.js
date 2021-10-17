import React from 'react';
import { Provider } from 'react-redux';
import store from './app/store';

import './index.css';
import FileBrowser from './components/FileBrowser';

const App = () => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <FileBrowser />
      </Provider>
    </React.StrictMode>
  );
};

export default App;
