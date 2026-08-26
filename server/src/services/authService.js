const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const memoryStore = require('../utils/memoryStore');

class AuthService {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  }

  async register({ name, email, password, role = 'operator' }) {
    if (this.isMongooseActive()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        const err = new Error('User already exists with this email address');
        err.statusCode = 400;
        throw err;
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role === 'admin' ? 'admin' : 'operator',
        lastLogin: new Date(),
      });

      const token = generateToken(user);
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      };
    } else {
      const existing = await memoryStore.findUserByEmail(email);
      if (existing) {
        const err = new Error('User already exists with this email address');
        err.statusCode = 400;
        throw err;
      }
      const user = await memoryStore.createUser({ name, email, password, role });
      const token = generateToken(user);
      return {
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      };
    }
  }

  async login({ email, password }) {
    if (this.isMongooseActive()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
        },
        token,
      };
    } else {
      const user = await memoryStore.findUserByEmail(email, true);
      if (!user) {
        // Auto-seed demo operator in memory store for instant test
        if (email.toLowerCase() === 'operator@agentflow.ai') {
          const seeded = await memoryStore.createUser({
            name: 'Demo Operator',
            email: 'operator@agentflow.ai',
            password,
            role: 'operator',
          });
          const token = generateToken(seeded);
          return {
            user: { id: seeded.id, name: seeded.name, email: seeded.email, role: seeded.role, lastLogin: seeded.lastLogin },
            token,
          };
        }
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
      }

      const token = generateToken(user);
      return {
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
        },
        token,
      };
    }
  }

  async getMe(userId) {
    if (this.isMongooseActive()) {
      const user = await User.findById(userId);
      if (!user) {
        const err = new Error('User profile not found');
        err.statusCode = 404;
        throw err;
      }
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      };
    } else {
      const user = await memoryStore.findUserById(userId);
      if (!user) {
        const err = new Error('User profile not found');
        err.statusCode = 404;
        throw err;
      }
      return {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      };
    }
  }
}

module.exports = new AuthService();
