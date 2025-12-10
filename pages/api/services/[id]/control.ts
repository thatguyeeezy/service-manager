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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const serviceId = parseInt(id as string);

  if (isNaN(serviceId)) {
    return res.status(400).json({ error: 'Invalid service ID' });
  }

  const { action } = req.body;

  if (!['start', 'stop', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    // Get service
    const [services] = await db.execute(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = services[0] as any;

    if (action === 'start') {
      // Check if already running
      if (serviceManager.isServiceRunning(serviceId)) {
        return res.status(400).json({ error: 'Service is already running' });
      }

      // Update status to starting
      await db.execute(
        'UPDATE services SET status = ? WHERE id = ?',
        ['starting', serviceId]
      );

      try {
        const pid = await serviceManager.startService(
          serviceId,
          service.start_command,
          service.working_directory,
          service.environment_vars
        );

        await db.execute(
          'UPDATE services SET status = ?, pid = ? WHERE id = ?',
          ['running', pid, serviceId]
        );

        res.status(200).json({
          message: 'Service started successfully',
          pid,
        });
      } catch (error: any) {
        await db.execute(
          'UPDATE services SET status = ? WHERE id = ?',
          ['error', serviceId]
        );
        throw error;
      }
    } else if (action === 'stop') {
      // Check if running
      if (!serviceManager.isServiceRunning(serviceId)) {
        return res.status(400).json({ error: 'Service is not running' });
      }

      // Update status to stopping
      await db.execute(
        'UPDATE services SET status = ? WHERE id = ?',
        ['stopping', serviceId]
      );

      const stopped = await serviceManager.stopService(
        serviceId,
        service.stop_command
      );

      if (stopped) {
        await db.execute(
          'UPDATE services SET status = ?, pid = NULL WHERE id = ?',
          ['stopped', serviceId]
        );
      }

      res.status(200).json({
        message: 'Service stopped successfully',
      });
    } else if (action === 'restart') {
      // Stop first
      if (serviceManager.isServiceRunning(serviceId)) {
        await db.execute(
          'UPDATE services SET status = ? WHERE id = ?',
          ['stopping', serviceId]
        );

        await serviceManager.stopService(serviceId, service.stop_command);
        await db.execute(
          'UPDATE services SET status = ?, pid = NULL WHERE id = ?',
          ['stopped', serviceId]
        );

        // Wait a bit before restarting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Start
      await db.execute(
        'UPDATE services SET status = ? WHERE id = ?',
        ['starting', serviceId]
      );

      try {
        const pid = await serviceManager.startService(
          serviceId,
          service.start_command,
          service.working_directory,
          service.environment_vars
        );

        await db.execute(
          'UPDATE services SET status = ?, pid = ? WHERE id = ?',
          ['running', pid, serviceId]
        );

        res.status(200).json({
          message: 'Service restarted successfully',
          pid,
        });
      } catch (error: any) {
        await db.execute(
          'UPDATE services SET status = ? WHERE id = ?',
          ['error', serviceId]
        );
        throw error;
      }
    }
  } catch (error: any) {
    console.error('Service control error:', error);
    res.status(500).json({
      error: 'Failed to control service',
      details: error.message,
    });
  }
}

