import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from '@/styles/Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <h2 className={styles.logo}>Service Manager</h2>
          <div className={styles.navRight}>
            <span className={styles.userInfo}>
              {user?.username} ({user?.role})
            </span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

