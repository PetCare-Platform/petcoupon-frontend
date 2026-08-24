import styles from './PlaceholderPage.module.css'

function PlaceholderPage({ title }) {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>준비 중인 페이지입니다.</p>
    </div>
  )
}

export default PlaceholderPage
