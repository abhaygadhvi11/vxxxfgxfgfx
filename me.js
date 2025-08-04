// pages/api/auth/me.js
import { verifyToken } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { rateLimiter } from '../../../lib/middleware/rateLimiter';

async function meHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        errors: { token: 'Authorization token required' } 
      });
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({ 
        errors: { token: 'Invalid or expired token' } 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        errors: { user: 'User not found' } 
      });
    }

    return res.status(200).json({
      success: true,
      //message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });

  } catch (error) {
    console.error('Me API error:', error);
    
    return res.status(500).json({ 
      error: 'Server error', 
      detail: error.message 
    });
  }
}

// Apply rate limiter to the handler
export default rateLimiter(meHandler);