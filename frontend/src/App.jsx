
import styles from './App.module.css'

function App() {

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          PULSIFY Radio
          <button className={styles.button}>HITS</button>
          <button className={styles.button}>NEW</button>

        </div>
        <div className={styles.container}>
          container
        </div>
        <div className={styles.footer}>
          footer
        </div>
      </div>
    </>
  )
}

export default App
