import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import css from './style.module.css';
import hamburger from '../Hamburger/style.module.css';
import { selectDownloads } from '../../reducers/filesSlice';
import ProgressRelay from '../../reducers/xhrProgressRelay';
import { fileSize } from '../../utility';

const FlashButton = ({ onClick }) => {
  const svg = useRef(null);

  useEffect(() => {
    setInterval(() => {
      if (svg.current) {
        svg.current.classList.toggle(css.hide);
      }
    }, 500);
  }, []);

  return (
    <button
      type="button"
      className={css.flashBtn}
      onClick={onClick}
      title="Show Showloads"
    >
      <svg
        ref={svg}
        className={css.arrow}
        viewBox="0 0 24 24"
      >
        <path
          d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z"
        />
      </svg>
    </button>
  )
};

FlashButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const Download = ({ id, name }) => {
  const [state, setState] = useState({ loaded: 0, total: 0 });
  const relay = ProgressRelay.getRelay(id);

  useEffect(() => {
    if (relay) {
      relay.subscribe((loaded, total) => {
        setState({ loaded, total });
      });
    }
    return () => {
      if (relay) {
        relay.unsubscribe();
      }
    }
  }, []);

  let percent;
  if (state.total) {
    percent = (100 * state.loaded) / state.total;
  }

  return (
    <div className={css.download}>
      <div className={`${css.downloadName} ellipsis`}>{name}</div>
      <div className={css.downloadProgress}>
        {state.total && (
        <progress value={percent} max="100">
          {percent.toFixed(1)}%
        </progress>
        )}
        {!state.total && (
        <progress max="100" />
        )
        }
      </div>
      <div className={css.downloadStatus}>
        <div>{(percent && percent.toFixed(1)) || '0'}%</div>
        <div>
          <span>{fileSize(state.loaded)}</span>
          <span>/</span>
          <span>
            {(state.total && fileSize(state.total)) || '--'}
          </span>
        </div>
      </div>
    </div>
  );
};

const Downloads = () => {
  const [isOpen, setOpen] = useState(false);
  const downloads = useSelector(selectDownloads);

  if (downloads.length <= 0) {
    if (isOpen) {
      setTimeout(() => setOpen(false));
    }
    return <></>;
  }

  const open = () => setOpen(true);

  if (!isOpen) return <FlashButton onClick={open} />;

  const close = () => setOpen(false);

  return(
    <div className={css.container}>
      <div className={css.header}>
        <button
          type="button"
          className={`${hamburger.hamburger} ${hamburger.open}`}
          onClick={close}
        >
          <span />
        </button>
      </div>
      <div className={css.body}>
        {downloads.map((d) => (
          <Download key={d.id} {...d} />))}
      </div>
    </div>
  );
};

export default Downloads;
