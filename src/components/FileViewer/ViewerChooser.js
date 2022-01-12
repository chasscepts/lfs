import React, { useState } from 'react';
import PropType from 'prop-types';
import SimpleTextViewer from './SimpleTextViewer';
import ImageViewer from './ImageViewer';
import { JsonViewerAdapter } from './JsonViewer';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import IFrame from './IFrame';
import ErrorView from './ErrorView';

const link = {
  display: 'flex',
  alignItems: 'center',
  minWidth: '300px',
  outline: 'none',
  border: 'none',
  padding: '5px 10px',
  color: '#333',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all .3s ease-in-out',
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  body: {
    padding: '1px 0',
  },
  header: {
    borderRadius: '5px 5px 0 0',
    padding: '10px',
    color: '#fff',
    backgroundColor: '#1c92d2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hoveredLink: {
    ...link,
    backgroundColor: '#60bbed',
    color: '#fff',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#1c92d2',
    fontWeight: 'bold',
    fontSize: '14px',
    marginRight: '5px',
  },
  openBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    outline: 'none',
    border: 'none',
    borderRadius: '5px',
    padding: '8px',
    color: '#fff',
    backgroundColor: '#1c92d2',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

const viewers = (() => {
  const obj = Object.create(null);
  obj['Text Viewer'] = SimpleTextViewer;
  obj['Image Viewer'] = ImageViewer;
  obj['Video Player'] = VideoPlayer;
  obj['Audio Player'] = AudioPlayer;
  obj['PDF Viewer'] = IFrame;
  obj['Json Viewer'] = JsonViewerAdapter;
  obj['Web Page Viewer'] = IFrame;

  return obj;
})();

const ViewerLink = ({ name, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => setHovered(false);

  const handleClick = () => onClick(name);

  let style = link;
  if (hovered) {
    style = styles.hoveredLink;
  } else if (isSelected) {
    style = { ...style, fontWeight: 'bold', color: '#1c92d2', };
  }

  return (
    <button
      style={style}
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isSelected && <span style={styles.checkmark}>&#x2713;</span>}
      <span>{name}</span>
    </button>
  );
};

ViewerLink.propTypes = {
  name: PropType.string.isRequired,
  isSelected: PropType.bool.isRequired,
  onClick: PropType.func.isRequired,
};

const ViewerChooser = ({ url, name }) => {
  const [isOpen, setOpen] = useState();
  const [selectedName, setSelectedName] = useState();

  // useEffect(() => {
  //   return () => URL.revokeObjectURL(url);
  // }, []);

  const selectViewer = (name) => {
    setSelectedName(name);
  };

  const openWithViewer = () => {
    if (selectedName) {
      setOpen(true);
    }
  };

  if (!isOpen) return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>Please Choose Application</div>
        <div style={styles.body}>
          {Object.keys(viewers).map((key) => (
            <ViewerLink key={key} name={key} onClick={selectViewer} isSelected={selectedName === key} />)
          )}
        </div>
        <button style={styles.openBtn} type="button" onClick={openWithViewer}>Open</button>
      </div>
    </div>
  );

  const Viewer = selectedName && viewers[selectedName];

  if (Viewer) return <Viewer content={url} name={name} />

  return <ErrorView msg="Application Error: Could not find selected application!" />;
};

ViewerChooser.propTypes = {
  url: PropType.string.isRequired,
  name: PropType.string,
};

ViewerChooser.defaultProps = {
  name: '',
};

export default ViewerChooser;
