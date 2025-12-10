import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';
import { serviceManager } from '@/lib/serviceManager';

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  authenticate(req, res, () => {
    handleRequest(req, res);
  });
}

async function handleRequest(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const serviceId = parseInt(id as string);

  if (isNaN(serviceId)) {
    return res.status(400).json({ error: 'Invalid service ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get service details
      const [services] = await db.execute(
        'SELECT * FROM services WHERE id = ?',
        [serviceId]
      );

      if (!Array.isArray(services) || services.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const service = services[0] as any;
      
      // Check if actually running
      const isRunning = serviceManager.isServiceRunning(serviceId);
      if (service.status === 'running' && !isRunning) {
        // Update status in database
        await db.execute(
          'UPDATE services SET status = ?, pid = NULL WHERE id = ?',
          ['stopped', serviceId]
        );
        service.status = 'stopped';
        service.pid = null;
      } else if (service.status !== 'running' && isRunning) {
        const pid = serviceManager.getServicePid(serviceId);
        await db.execute(
          'UPDATE services SET status = ?, pid = ? WHERE id = ?',
          ['running', pid, serviceId]
        );
        service.status = 'running';
        service.pid = pid;
      }

      res.status(200).json({ service });
    } else if (req.method === 'PUT') {
      // Update service
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        name,
        description,
        type,
        port,
        external_port,
        working_directory,
        start_command,
        stop_command,
        environment_vars,
        auto_restart,
      } = req.body;

      await db.execute(
        `UPDATE services SET 
         name = ?, description = ?, type = ?, port = ?, external_port = ?,
         working_directory = ?, start_command = ?, stop_command = ?,
         environment_vars = ?, auto_restart = ?
         WHERE id = ?`,
        [
          name,
          description,
          type,
          port,
          external_port,
          working_directory,
          start_command,
          stop_command,
          environment_vars,
          auto_restart,
          serviceId,
        ]
      );

      const [services] = await db.execute(
        'SELECT * FROM services WHERE id = ?',
        [serviceId]
      );

      res.status(200).json({
        message: 'Service updated successfully',
        service: Array.isArray(services) && services.length > 0 ? services[0] : null,
      });
    } else if (req.method === 'DELETE') {
      // Delete service
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Stop service if running
      const isRunning = serviceManager.isServiceRunning(serviceId);
      if (isRunning) {
        await serviceManager.stopService(serviceId);
      }

      await db.execute('DELETE FROM services WHERE id = ?', [serviceId]);

      res.status(200).json({ message: 'Service deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Service API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

