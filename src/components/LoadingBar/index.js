import styles from './style.module.css';

export default function LoadingBar({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.ldsSpinner}>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <div className={styles.children}>{children}</div>
    </div>
  );
}
