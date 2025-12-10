import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, UserPayload } from './auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: UserPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

