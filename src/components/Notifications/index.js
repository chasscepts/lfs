import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNotifications, popNotification } from '../../reducers/notificationSlice';
import css from './index.module.css';

const Notice = ({ notice }) => {
  const dispatch = useDispatch();
  const wrap = useRef();

  useEffect(() => {
    wrap.current.classList.add(css.open);
  }, []);

  const close = () => {
    wrap.current.classList.remove(css.open);
    setTimeout(() => dispatch(popNotification(notice.id)), 1000);
  };

  let wrapClass = css.notice;
  if (notice.type === 'error') {
    wrapClass = `${wrapClass} ${css.error}`;
  }

  return (
    <div className={wrapClass} ref={wrap}>
      <div className={css.noticeInner}>
        {notice.message || notice.text}
        <button className={css.close} type="button" onClick={close}>X</button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const notifications = useSelector(selectNotifications);

  if (notifications.length <= 0) return <></>;

  return (
    <div className={css.container}>
      {notifications.map((notice) => <Notice key={notice.id} notice={notice} />)}
    </div>
  );
}

export default Notifications;
