// pages/api/auth/login.js
import { comparePassword, generateToken } from '../../../lib/auth';
import { validate } from '../../../lib/validation/validator';
import { loginSchema } from '../../../lib/validation/auth';
import prisma from '../../../lib/prisma';
import { rateLimiter } from '../../../lib/middleware/rateLimiter';

async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const validationResult = validate(loginSchema, req.body);
  
  if (validationResult !== null) {
    return res.status(400).json({ errors: validationResult });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      return res.status(401).json({ 
        errors: { email: 'Invalid credentials' } 
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        errors: { password: 'Invalid credentials' } 
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      //message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
        token,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    
    return res.status(500).json({ 
      error: 'Server error', 
      detail: error.message 
    });
  }
}

// Apply rate limiter to the handler
export default rateLimiter(loginHandler);