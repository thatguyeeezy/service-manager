import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (first user is admin)
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const count = Array.isArray(userCount) && userCount.length > 0 
      ? (userCount[0] as any).count : 0;
    const role = count === 0 ? 'admin' : 'user';

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Generate token
    const token = generateToken({
      id: userId,
      username,
      email,
      role,
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

