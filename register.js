// pages/api/auth/register.js
import { registerSchema } from '../../../lib/validation/auth';
import { validate } from '../../../lib/validation/validator';
import { hashPassword, generateToken } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { rateLimiter } from '../../../lib/middleware/rateLimiter';

async function registerHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const validationResult = validate(registerSchema, req.body);

  // Check if validation failed
  if (validationResult !== null) {
    return res.status(400).json({ errors: validationResult });
  }

  const { name, email, password, organizationId, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        errors: { email: 'User with this email already exists' }
      });
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: { 
        name,
        email,
        passwordHash,
        organizationId: organizationId || null,
        role: role || 'USER', // Use enum value from schema
      },
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Return success response
    return res.status(201).json({
      success: true,
      //message: 'User registered successfully',
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
    console.error('Registration error:', error);

    // Handle specific database errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        errors: { email: 'User with this email already exists' }
      });
    }

    return res.status(500).json({
      error: 'Server error',
      detail: error.message
    });
  }
}

// Apply rate limiter to the handler
export default rateLimiter(registerHandler);

