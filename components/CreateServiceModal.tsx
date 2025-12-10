import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/CreateServiceModal.module.css';

export default function CreateServiceModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'teamspeak',
    port: '',
    external_port: '',
    working_directory: '',
    start_command: '',
    stop_command: '',
    environment_vars: '',
    auto_restart: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          port: formData.port ? parseInt(formData.port) : null,
          external_port: formData.external_port ? parseInt(formData.external_port) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create service');
      }

      onCreated();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Create New Service</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Service Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="My Teamspeak Server"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description of the service"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="type">Service Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="teamspeak">Teamspeak Server</option>
              <option value="teamspeak-bot">Teamspeak Bot</option>
              <option value="nextjs">Next.js Application</option>
              <option value="node">Node.js Application</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="port">Port</label>
              <input
                id="port"
                name="port"
                type="number"
                value={formData.port}
                onChange={handleChange}
                placeholder="9987"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="external_port">External Port</label>
              <input
                id="external_port"
                name="external_port"
                type="number"
                value={formData.external_port}
                onChange={handleChange}
                placeholder="9987"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="working_directory">Working Directory *</label>
            <input
              id="working_directory"
              name="working_directory"
              type="text"
              value={formData.working_directory}
              onChange={handleChange}
              required
              placeholder="C:/services/teamspeak"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="start_command">Start Command *</label>
            <input
              id="start_command"
              name="start_command"
              type="text"
              value={formData.start_command}
              onChange={handleChange}
              required
              placeholder="ts3server_startscript.bat start"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="stop_command">Stop Command</label>
            <input
              id="stop_command"
              name="stop_command"
              type="text"
              value={formData.stop_command}
              onChange={handleChange}
              placeholder="ts3server_startscript.bat stop"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="environment_vars">Environment Variables (JSON or key=value)</label>
            <textarea
              id="environment_vars"
              name="environment_vars"
              value={formData.environment_vars}
              onChange={handleChange}
              rows={4}
              placeholder='{"NODE_ENV": "production"} or NODE_ENV=production'
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="auto_restart"
                checked={formData.auto_restart}
                onChange={handleChange}
              />
              Auto-restart on failure
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

