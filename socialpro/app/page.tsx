"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import UserLayout from "./componets/UserLayout";

export default function HomePage() {

  const router = useRouter();
  return (
    <UserLayout>
    <div className={styles.container}>
      <div className={styles.mainContainer}>
        <div className={styles.mainContainer_left}>
          <p>Connect with Friends without Exaggeration</p>
          <p>A True social media platform with stories no bluffs</p>
          <div className={styles.buttonJoin} onClick={()=>{
            router.push('/login')
          }}>
            <p>Join now</p>
          </div>
        </div>
        <div className={styles.mainContainer_right}>
          <img src="/images/main.jpeg" alt="Description of image" />
        </div>
      </div>
    </div>
    </UserLayout>
  );
}
