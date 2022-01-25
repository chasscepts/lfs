import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectUser,
  selectLoginError,
  selectUserLoading,
} from '../../reducers/userSlice';
import css from './style.module.css';

const Container = ({ children }) => (
  <div className={css.container}>
    <h4 className={css.header}>Current User</h4>
    {children}
  </div>
);

const User = () => {
  const user = useSelector(selectUser);
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectLoginError);

  if (loading) return (
    <Container>
      <div>

      </div>
    </Container>
  );

  return (
    <Container>
      <div>
        
      </div>
    </Container>
  );
};
