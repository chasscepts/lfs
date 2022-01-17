import React, { useState } from 'react';
import { Provider } from 'react-redux';
import store from './app/store';

import './index.css';
import FileBrowser from './components/FileBrowser';
import FileViewer from './components/FileViewer';
import Notifications from './components/Notifications';
import TestComponent from './components/TestComponent';
import Drawer from './components/Drawer';
import Downloads from './components/Downloads';

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

const TestBtn = ({ onClick }) => {
  return <></>;
  // return (
  //   <button
  //     style={styles.testBtn}
  //     type="button"
  //     onClick={onClick}
  //   >
  //     <span>+</span>
  //   </button>
  // );
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
          <Downloads />
          <Notifications />
          <TestBtn onClick={toggleMode} />
        </div>
      </Provider>
    </React.StrictMode>
  );
};

export default App;
