import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
};

const VideoPlayer = ({ content }) => (
  <div style={styles.container}>
    <video style={styles.video} src={content} controls autoPlay />
  </div>
);

VideoPlayer.propTypes = {
  content: PropTypes.string.isRequired,
};

export default VideoPlayer;
