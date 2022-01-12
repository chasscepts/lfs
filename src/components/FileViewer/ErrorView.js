import React from 'react';
import PropTypes from 'prop-types';
import css from './index.module.css';

const ErrorView = ({ msg }) => {
  return (
    <div className={css.centerChild}>
      <div className={css.middleChild} style={{ padding: '40px' }}>
        <div className={css.errorText}>{msg}</div>
      </div>
    </div>
  );
};

ErrorView.propTypes = {
  msg: PropTypes.string.isRequired,
};

export default ErrorView;
