import prisma from '../utils/prisma.mjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from '../validators/auth.mjs';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is required');

// Helper to hash password
const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

// Authenticate admin user
export const login = async (req, res, next) => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;

    const adminUser = await prisma.admin.findUnique({ where: { email } });

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const computedHash = hashPassword(password, adminUser.salt);
    if (computedHash !== adminUser.passwordHash) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate secure JWT payload
    const payload = { 
      userId: adminUser.id, 
      email: adminUser.email, 
      isAdmin: true, // Crucial for rbac.middleware
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Admin login successful', 
      token, 
      user: { name: adminUser.name, email: adminUser.email, isAdmin: true } 
    });
  } catch (err) {
    next(err);
  }
};

// Customer Registration
export const register = async (req, res, next) => {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, salt }
    });

    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ message: 'Registered successfully', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

// Customer Login
export const customerLogin = async (req, res, next) => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

// Google OAuth Login / Guest Account Claiming
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential missing' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid Google token' });

    const { email, name, sub: googleId } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create user without password (OAuth only)
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          passwordHash: '',
          salt: ''
        }
      });
    }

    const jwtPayload = { userId: user.id, email: user.email };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: 'Google login successful', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// Get Me (Session Verify)
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, name: true, email: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (err) { next(err); }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = UpdateProfileSchema.parse(req.body);
    const { name, email, currentPassword, newPassword } = validatedData;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let updateData = { name, email };

    if (currentPassword && newPassword) {
      const computedHash = hashPassword(currentPassword, user.salt);
      if (computedHash !== user.passwordHash) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }
      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword(newPassword, newSalt);
      updateData.passwordHash = newHash;
      updateData.salt = newSalt;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: { id: true, name: true, email: true }
    });

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) { next(err); }
};
