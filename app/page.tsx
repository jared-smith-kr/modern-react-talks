import styles from "./page.module.css";
import { MyItemSelect } from "../components/talk1/MyItemSelect";
import { MyItemSelect as MyItemSelect2 } from "../components/talk2/MyItemSelect";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section id="talk1">
          <MyItemSelect />
        </section>
        <section id="talk2">
          <MyItemSelect2 />
        </section>
      </main>
    </div>
  );
}
