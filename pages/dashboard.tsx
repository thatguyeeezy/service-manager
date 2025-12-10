import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import ServiceList from '@/components/ServiceList';
import Layout from '@/components/Layout';
import styles from '@/styles/Dashboard.module.css';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>Service Dashboard</h1>
          <p className={styles.welcome}>
            Welcome back, <strong>{user?.username}</strong>
          </p>
        </div>
        <ServiceList />
      </div>
    </Layout>
  );
}

