import { RamsName } from "./RamsName";
import { Wordmark } from "./Wordmark";
import styles from "./rams-identity.module.css";

/** Documentation identity for the RAMS viewer. */
export function RamsIdentity() {
  return <span className={styles.identity}>
    <RamsName logo />{" "}
    <span className={styles.attribution}><span className={styles.credit}>by</span>{" "}
      <Wordmark master={48} className={styles.author} />
    </span>
  </span>;
}
