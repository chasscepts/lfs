import React from 'react';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  iframe: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
};

const IFrameViewer = ({content}) => {
  return (
    <div style={styles.container}>
      <iframe style={styles.iframe} src={content} />
    </div>
  );
};

export default IFrameViewer;
