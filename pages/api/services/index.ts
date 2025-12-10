import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { authenticate, AuthenticatedRequest } from '@/lib/middleware';

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
  try {
    if (req.method === 'GET') {
      // Get all services
      const [services] = await db.execute(
        `SELECT s.*, u.username as created_by_username 
         FROM services s 
         LEFT JOIN users u ON s.created_by = u.id 
         ORDER BY s.created_at DESC`
      );

      res.status(200).json({ services });
    } else if (req.method === 'POST') {
      // Create new service
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

      if (!name || !type || !working_directory || !start_command) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const [result] = await db.execute(
        `INSERT INTO services 
         (name, description, type, port, external_port, working_directory, 
          start_command, stop_command, environment_vars, auto_restart, created_by, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'stopped')`,
        [
          name,
          description || null,
          type,
          port || null,
          external_port || null,
          working_directory,
          start_command,
          stop_command || null,
          environment_vars || null,
          auto_restart || false,
          req.user.id,
        ]
      );

      const insertResult = result as any;
      const serviceId = insertResult.insertId;

      // Fetch created service
      const [services] = await db.execute(
        'SELECT * FROM services WHERE id = ?',
        [serviceId]
      );

      res.status(201).json({
        message: 'Service created successfully',
        service: Array.isArray(services) && services.length > 0 ? services[0] : null,
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Services API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

