import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import styles from '@/styles/ServiceConsole.module.css';

interface Service {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  port: number | null;
  external_port: number | null;
  working_directory: string;
  start_command: string;
  stop_command: string | null;
}

export default function ServiceConsole() {
  const router = useRouter();
  const { id } = router.query;
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Array<{ data: string; type: string; timestamp: string }>>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (!id || !token) return;

    fetchService();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id, token, isAuthenticated, authLoading]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service');
      }

      const data = await response.json();
      setService(data.service);
    } catch (err: any) {
      setError(err.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    try {
      // Get WebSocket token
      const tokenResponse = await fetch('/api/ws-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get WebSocket token');
      }

      const { token: wsToken } = await tokenResponse.json();
      const wsPort = process.env.NEXT_PUBLIC_WS_PORT || '3001';
      // Use window.location.hostname for proper host detection
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const wsUrl = `ws://${hostname}:${wsPort}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        // Authenticate
        ws.send(JSON.stringify({ type: 'authenticate', token: wsToken }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'authenticated') {
            setWsConnected(true);
            // Subscribe to service logs
            ws.send(JSON.stringify({ type: 'subscribe', serviceId: parseInt(id as string) }));
          } else if (data.type === 'subscribed') {
            // Successfully subscribed
          } else if (data.type === 'log') {
            setLogs((prev) => [
              ...prev,
              {
                data: data.data,
                type: data.logType,
                timestamp: data.timestamp,
              },
            ]);
          } else if (data.type === 'error') {
            setError(data.message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        setWsConnected(false);
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          if (id && token) {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err: any) {
      setError(err.message || 'Failed to connect to console');
    }
  };

  const handleControl = async (action: 'start' | 'stop' | 'restart') => {
    try {
      const response = await fetch(`/api/services/${id}/control`, {
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

      // Refresh service status
      setTimeout(fetchService, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className={styles.loading}>Loading...</div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className={styles.error}>Service not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.console}>
        <div className={styles.header}>
          <div>
            <h1>{service.name}</h1>
            <p className={styles.description}>{service.description || 'No description'}</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className={styles.infoBar}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Status:</span>
            <span
              className={styles.status}
              style={{
                color:
                  service.status === 'running'
                    ? '#10b981'
                    : service.status === 'error'
                    ? '#ef4444'
                    : '#94a3b8',
              }}
            >
              {service.status}
            </span>
          </div>
          {service.port && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Port:</span>
              <span className={styles.value}>{service.port}</span>
            </div>
          )}
          <div className={styles.infoItem}>
            <span className={styles.label}>Console:</span>
            <span
              className={styles.value}
              style={{ color: wsConnected ? '#10b981' : '#ef4444' }}
            >
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.controls}>
          {service.status === 'running' ? (
            <>
              <button
                onClick={() => handleControl('restart')}
                className={styles.restartButton}
              >
                Restart
              </button>
              <button
                onClick={() => handleControl('stop')}
                className={styles.stopButton}
              >
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={() => handleControl('start')}
              className={styles.startButton}
            >
              Start
            </button>
          )}
          <button onClick={clearLogs} className={styles.clearButton}>
            Clear Logs
          </button>
        </div>

        <div className={styles.logContainer}>
          <div className={styles.logs}>
            {logs.length === 0 ? (
              <div className={styles.emptyLogs}>
                {wsConnected
                  ? 'No logs yet. Start the service to see output.'
                  : 'Connecting to console...'}
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`${styles.logLine} ${
                    log.type === 'stderr' ? styles.logError : ''
                  }`}
                >
                  <span className={styles.logTimestamp}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={styles.logContent}>{log.data}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

