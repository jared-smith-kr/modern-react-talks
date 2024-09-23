import styles from "./page.module.css";
import { MyItemSelect } from "../components/talk1/MyItemSelect";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section id="talk1">
          <MyItemSelect />
        </section>
      </main>
    </div>
  );
}
