const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: 'Email exists' });

    const hashed = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashed,
      role,
      department,
      employeeId
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    // ⭐ INCLUDE createdAt in response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    // ⭐ INCLUDE createdAt in login response too
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
