const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/users - get all users (admin only)
router.get('/', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/users - create user (admin only)
router.post('/', verifyToken, requireRole('super_admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, hashed, role]
    );
    res.status(201).json({ message: 'User created.', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Email already exists.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/users/:id/toggle - toggle active status
router.put('/:id/toggle', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active`,
      [req.params.id]
    );
    res.json({ message: 'User status updated.', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
