import React, { useState } from 'react';
import { Provider } from 'react-redux';
import store from './app/store';

import './index.css';
import FileBrowser from './components/FileBrowser';
import FileViewer from './components/FileViewer';
import Notifications from './components/Notifications';
import TestComponent from './components/TestComponent';
import Drawer from './components/Drawer';

const styles = {
  testBtn: {
    position: 'fixed',
    right: '10px',
    bottom: '10px',
    width: '40px',
    height: '40px',
    outline: 'none',
    border: '1px solid #ddd',
    borderRadius: '50%',
    color: '#fff',
    background: 'linear-gradient(#1c92d2, #f2fcfe)',
    fontWeight: 'bold',
    fontSize: '22px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const App = () => {
  const [isTestMode, setTestMode] = useState(false);

  const toggleMode = () => setTestMode(!isTestMode);

  if (isTestMode) return <TestComponent close={toggleMode} />

  return (
    <React.StrictMode>
      <Provider store={store}>
        <div>
          <FileBrowser />
          <FileViewer />
          <Drawer />
          <Notifications />
          <button style={styles.testBtn} type="button" onClick={toggleMode}><span>+</span></button>
        </div>
      </Provider>
    </React.StrictMode>
  );
};

export default App;
