import styles from "./page.module.css";
import { MyItemSelect } from "../components/talk1/MyItemSelect";
import { MyItemSelect as MyItemSelect2 } from "../components/talk2/MyItemSelect";
import { MyForm } from "../components/talk3/MyForm";
import { MyServerForm } from "../components/talk3/MyServerForm";

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
        <section id="talk3">
          <MyForm />
          <MyServerForm />
        </section>
      </main>
    </div>
  );
}
