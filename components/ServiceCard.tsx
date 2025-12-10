import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/ServiceCard.module.css';

interface Service {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  port: number | null;
  external_port: number | null;
}

export default function ServiceCard({
  service,
  onDeleted,
}: {
  service: Service;
  onDeleted: () => void;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleControl = async (action: 'start' | 'stop' | 'restart') => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/services/${service.id}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to control service');
      }

      // Refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      onDeleted();
    } catch (err: any) {
      setError(err.message || 'Failed to delete service');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#10b981';
      case 'stopped':
        return '#6b7280';
      case 'starting':
      case 'stopping':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{service.name}</h3>
        <div
          className={styles.status}
          style={{ backgroundColor: getStatusColor(service.status) }}
        >
          {service.status}
        </div>
      </div>

      <p className={styles.description}>{service.description || 'No description'}</p>

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Type:</span>
          <span className={styles.value}>{service.type}</span>
        </div>
        {service.port && (
          <div className={styles.infoItem}>
            <span className={styles.label}>Port:</span>
            <span className={styles.value}>{service.port}</span>
          </div>
        )}
        {service.external_port && (
          <div className={styles.infoItem}>
            <span className={styles.label}>External:</span>
            <span className={styles.value}>{service.external_port}</span>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button
          onClick={() => router.push(`/services/${service.id}`)}
          className={styles.viewButton}
        >
          View Console
        </button>
        <div className={styles.controlButtons}>
          {service.status === 'running' ? (
            <>
              <button
                onClick={() => handleControl('restart')}
                className={styles.restartButton}
                disabled={loading}
              >
                Restart
              </button>
              <button
                onClick={() => handleControl('stop')}
                className={styles.stopButton}
                disabled={loading}
              >
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={() => handleControl('start')}
              className={styles.startButton}
              disabled={loading}
            >
              Start
            </button>
          )}
        </div>
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
          disabled={loading}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

