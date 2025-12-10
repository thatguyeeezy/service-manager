import type { NextApiRequest, NextApiResponse } from 'next';
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return the token for WebSocket authentication
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  res.status(200).json({ token });
}

