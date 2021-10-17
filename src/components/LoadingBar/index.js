import styles from './style.module.css';

export default function LoadingBar() {
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
    </div>
  );
}
