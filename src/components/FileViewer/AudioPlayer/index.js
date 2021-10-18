import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import bg from './images/audioBG.jpg';
import flame from './images/flame.png';
import wave1 from './images/wave1.gif';
import wave2 from './images/wave2.gif';
import wave3 from './images/wave2.gif';
import playBtn from './images/playBtn.png';
import pauseBtn from './images/pauseBtn.png';
import stopBtn from './images/stopBtn.png';
import mute from './images/mute3.png';
import unmute from './images/mute0.png';
import timelineClass from './timeline.module.css';
import ringClass from './audioplayer.module.css';

const waves = [wave1, wave2, wave3];

const wave = () => waves[Math.floor(waves.length * Math.random())];

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: `url(${bg})`,
    backgroundSize: '100% 100%',
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  child: {
    position: 'reltive',
    width: '300px',
  },
  flame: {
    position: 'relative',
    width: '300px',
    height: '300px',
    background: `url(${flame})`,
    backgroundSize: '100% 100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    width: '120px',
    height: '60px',
    background: `url(${wave()})`,
    backgroundSize: '100% 100%',
  },
  controlBtn: {
    outline: 'none',
    border: 'none',
    padding: 0,
    backgroundSize: '100%',
    backgroundColor: 'transparent',
    transition: 'all 0.5s linear',
  },
  controls: {
    width: '100%',
    padding: '5px',
    border: '1px solid #16191a',
    borderRadius: '0 0 4px 4px',
    display: 'flex',
    alignItems: 'center',
    minHeight: '42px',
  },
  timelineWrap: {
    marginTop: '8px',
    border: '1px solid #16191a',
    borderRadius: '4px 4px 0 0',
    padding: '2px',
  },
  timeline: {
    display: 'block',
    width: '100%',
  },
  volumeWrap: {
    margin: '0 7px',
    display: 'flex',
    alignItems: 'center',
  },
  levelWrap: {
    marginLeft: '10px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d6d6d6',
    borderRadius: '2px',
  },
  muteWrap: {
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteBtn: (muted, scale) => ({
    width: '30px',
    height: '30px',
    outline: 'none',
    border: 'none',
    padding: 0,
    backgroundImage: `url(${muted ? unmute : mute})`,
    backgroundSize: '100%',
    backgroundColor: 'transparent',
    transition: 'all 0.5s linear',
    transform: `scale(${scale})`,
  }),
  timeWrap: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  time: {
    color: '#fff',
    fontSize: '0.8rem',
  },
  timeSep: {
    color: '#fff',
    fontSize: '0.8rem',
    margin: '0 3px',
  },
};

const ControlButton = ({ onClick, size, bg, style }) => {
  const [scale, setSCale] = useState(1);
  const handleMouseEnter = () => setSCale(0.9)
  const handleMouseLeave = () => setSCale(1);

  const btnStyle = { ...styles.controlBtn, width: size, height: size, backgroundImage: `url(${bg})`, transform: `scale(${scale})` };

  let wrapStyle = {
    width: size, height: size,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  };

  if (style) {
    wrapStyle = { ...wrapStyle, ...style };
  }

  return (
    <div style={wrapStyle}>
      <button
        style={btnStyle}
        type="button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}

ControlButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  size: PropTypes.string.isRequired,
  bg: PropTypes.oneOfType([
    PropTypes.string, PropTypes.node,
  ]).isRequired,
  style: PropTypes.shape({
    [PropTypes.string]: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

ControlButton.defaultProps = {
  style: null,
}

const volumeLevel = (() => {
  const buttons = [...new Array(20)].map((a, i) => i + 1);
  const neutral = '#6b6b6b';
  const cold = '#07fc97';
  const warm = '#cc4613';
  const hot = '#ff1221';

  const style = (vol, pos, muted) => {
    let bg;
    if (muted || pos > vol) {
      bg = neutral;
    } else if (pos > 18) {
      bg = hot;
    } else if (pos > 14) {
      bg = warm;
    } else {
      bg = cold;
    }

    return {
      width: '4px',
      height: '7px',
      outline: 'none',
      border: 'none',
      borderRadius: '1px',
      padding: 0,
      backgroundColor: bg,
      transition: 'all 0.5s linear',
      cursor: 'pointer',
    };
  }

  return {
    buttons,
    style,
    initialValue: 0.4,
  }
})();

const VolumeControl = ({ mute, onChange }) => {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(volumeLevel.initialValue * 20);
  const [scale, setScale] = useState(0.9);
  const handleHover = () => setScale(1);
  const handleLeave = () => setScale(0.9);

  const toggleMute = () => {
    const temp = !muted;
    mute(temp);
    setMuted(temp);
  }

  const handleClick = ({ target: { name } }) => {
    const val = +name;
    setVolume(val);
    onChange(val / 20);
    if (muted) toggleMute();
  }

  return (
    <div style={styles.volumeWrap}>
      <div onMouseEnter={handleHover} onMouseLeave={handleLeave}>
        <button style={styles.muteBtn(muted, scale)} type="button" onClick={toggleMute} />
      </div>
      <div style={styles.levelWrap}>
        {volumeLevel.buttons.map((btn) => (
        <button style={volumeLevel.style(volume, btn, muted)} key={btn} name={`${btn}`} type="button" onClick={handleClick}  />
        ))}
      </div>
    </div>
  );
};

VolumeControl.propTypes = {
  mute: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

const ControlStub = ({ size, bg }) => (
  <div style={{
    width: size, height: size, backgroundImage: `url(${bg})`, backgroundSize: '100%', margin: '0 4px',
  }} />
);

ControlStub.propTypes = {
  size: PropTypes.string.isRequired,
  bg: PropTypes.oneOfType([
    PropTypes.string, PropTypes.node,
  ]).isRequired,
};

const doubleDigit = (num) => num < 10 ? `0${num}` : num;

const timeText = (time) => {
  let secs = time;
  const hrs = Math.floor(secs / 3600);
  secs %= 3600;
  const mins = Math.floor(secs / 60);
  secs = Math.round(secs % 60);

  return `${hrs ? doubleDigit(hrs) + ':' : ''}${doubleDigit(mins)}:${doubleDigit(secs)}`;
};

let player = new Audio();
player.volume = volumeLevel.initialValue;

const AudioPlayer = ({ content }) =>  {
  const [playState, setPlayState] = useState('stopped');
  const [duration, setDuration] = useState({ value: 0, text: '00:00' });
  const [currentTime, setCurrentTime] = useState({ value: 0, text: '00:00' });
  const [canSeek, setCanSeek] = useState(false);
  const timelime = useRef();

  const play = () => player.play();
  const pause = () => player.pause();
  const stop = () => (player.currentTime = player.duration);
  const mute = (muted) => (player.muted = muted);
  const setVolume = (vol) => (player.volume = vol);
  
  const setupDuration = () => {
    const dur = player.duration;
    if (dur === duration.value) return;
    setCurrentTime({ value: 0, text: '00:00' });
    if (isNaN(dur)) {
      setDuration({ value: NaN, text: '--:--' });
      setCanSeek(false);
      return;
    }
    setDuration({ value: dur, text: timeText(dur) });
    setCanSeek(true);
  }

  const handleSeek = ({ target: { value } }) => {
    if (canSeek) {
      player.currentTime = value;
      // setCurrentTime({ value, text: timeText(value) });
    }
  };

  useEffect(() => {
    player = new Audio();
    player.volume = volumeLevel.initialValue;
    player.onplaying = () => setPlayState('playing');
    player.onended = () => setPlayState('stopped');
    player.onpause = () => setPlayState('paused');
    player.onerror = () => setPlayState('stopped');
    player.onloadedmetadata = setupDuration;
    player.ontimeupdate = () => setCurrentTime({
      value: player.currentTime, text: timeText(player.currentTime),
    });

    return () => {
      player.pause();
      player.onplaying = null;
      player.onended = null;
      player.onpause = null;
      player.onerror = null;
      player.onloadedmetadata = null;
      player.ontimeupdate = null;
      player = null;
    }
  }, []);

  useEffect(() => (player.src = content), [content]);

  return (
    <div style={styles.container}>
      <div style={styles.child}>
        <div style={styles.flame}>
          {playState === 'playing' && <div style={styles.wave}></div>}
          {playState !== 'playing' && <ControlButton onClick={play} size="100px" bg={playBtn} />}
          {playState === 'playing' && (
          <div style={styles.ringWrap}><div className={ringClass.ring} /></div>
          )}
        </div>
        <div style={styles.timelineWrap}>
          <input
            style={styles.timeline}
            className={timelineClass}
            type="range"
            ref={timelime}
            max={duration.value}
            value={currentTime.value}
            onChange={handleSeek}
          />
        </div>
        <div style={styles.controls}>
          {playState !== 'stopped' && <ControlButton onClick={stop} size="30px" bg={stopBtn} style={{ margin: '0 4px' }} />}
          {playState === 'stopped' && <ControlStub size="30px" bg={stopBtn} />}
          {playState === 'playing' && <ControlButton onClick={pause} size="30px" bg={pauseBtn} style={{ margin: '0 4px' }} />}
          {playState !== 'playing' && <ControlStub size="30px" bg={pauseBtn} />}
          <VolumeControl mute={mute} onChange={setVolume} />
          <div style={styles.timeWrap}>
            <span style={styles.time}>{currentTime.text}</span>
            <span style={styles.timeSep}>/</span>
            <span style={styles.time}>{duration.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

AudioPlayer.propTypes = {
  content: PropTypes.string.isRequired,
};

export default AudioPlayer;
