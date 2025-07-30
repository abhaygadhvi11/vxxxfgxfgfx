// // lib/auth.js
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';

// export async function hashPassword(password) {
//   const saltRounds = 12;
//   return await bcrypt.hash(password, saltRounds);
// }

// export async function comparePassword(password, hash) {
//   return await bcrypt.compare(password, hash);
// }

// export function generateToken(payload) {
//   return jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.TOKEN_EXPIRY || '1d',
//   });
// }

// export function verifyToken(token) {
//   return jwt.verify(token, process.env.JWT_SECRET);
// }

// export function authenticate(handler) {
//   return async (req, res) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized: No token" });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//       const decoded = verifyToken(token);
//       req.user = decoded;
//       return handler(req, res);
//     } catch (err) {
//       return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }
//   };
// }

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export function generateToken(payload) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not defined');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export function authenticate(req, res, next) {
  const headers = req.headers || {};
  const authHeader =
    headers.authorization || headers.Authorization || headers.get?.('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (res?.status && res?.json) {
      return res.status(401).json({ message: 'Unauthorized: No token' });
    } else if (res?.statusCode !== undefined && typeof res.end === 'function') {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Unauthorized: No token' }));
    } else {
      throw new Error('Unauthorized: No token');
    }
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (res?.status && res?.json) {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (res?.statusCode !== undefined && typeof res.end === 'function') {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Invalid token' }));
    } else {
      throw new Error('Invalid token');
    }
  }
}
