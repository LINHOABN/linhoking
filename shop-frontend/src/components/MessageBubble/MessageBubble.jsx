import styles from "./MessageBubble.module.css";

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`${styles.row} ${isOwn ? styles.own : ""}`}>
      <div className={styles.bubble}>
        <p className={styles.text}>{message.text}</p>
      </div>
      <span className={styles.time}>{message.time}</span>
    </div>
  );
}
