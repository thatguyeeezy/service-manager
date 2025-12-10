import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from '@/styles/LoginForm.module.css';

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
        router.push('/dashboard');
      } else {
        await register(username, email, password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Service Manager</h1>
        <p className={styles.subtitle}>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className={styles.toggleButton}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

