import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ServiceCard from './ServiceCard';
import CreateServiceModal from './CreateServiceModal';
import styles from '@/styles/ServiceList.module.css';

interface Service {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  port: number | null;
  external_port: number | null;
  created_at: string;
}

export default function ServiceList() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchServices();
      // Refresh every 5 seconds
      const interval = setInterval(fetchServices, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleServiceCreated = () => {
    setShowCreateModal(false);
    fetchServices();
  };

  const handleServiceDeleted = () => {
    fetchServices();
  };

  if (loading) {
    return <div className={styles.loading}>Loading services...</div>;
  }

  return (
    <div className={styles.serviceList}>
      <div className={styles.header}>
        <h2>Your Services</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className={styles.createButton}
        >
          + Create Service
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {services.length === 0 ? (
        <div className={styles.empty}>
          <p>No services yet. Create your first service to get started!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onDeleted={handleServiceDeleted}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateServiceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleServiceCreated}
        />
      )}
    </div>
  );
}

