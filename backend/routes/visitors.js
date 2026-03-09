const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Generate a random pass code
const generatePassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VIS-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// GET /api/visitors
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, e.name as host_name 
      FROM visitors v
      LEFT JOIN employees e ON v.host_employee_id = e.id
      ORDER BY v.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/visitors/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM visitors WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Visitor not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/visitors - create visitor + generate pass
router.post('/', verifyToken, requireRole('super_admin', 'security_staff'), async (req, res) => {
  const { name, phone, email, purpose, host_employee_id, valid_from, valid_until } = req.body;
  if (!name || !valid_from || !valid_until)
    return res.status(400).json({ message: 'Name, valid_from, and valid_until are required.' });

  try {
    const pass_code = generatePassCode();
    const result = await pool.query(
      `INSERT INTO visitors (name, phone, email, purpose, host_employee_id, pass_code, valid_from, valid_until, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, phone, email, purpose, host_employee_id, pass_code, valid_from, valid_until, req.user.id]
    );
    res.status(201).json({ message: 'Visitor pass created.', visitor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/visitors/:id/status - update pass status
router.put('/:id/status', verifyToken, requireRole('super_admin', 'security_staff'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE visitors SET status=$1 WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    res.json({ message: 'Visitor status updated.', visitor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/visitors/:id (admin only)
router.delete('/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM visitors WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Visitor deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
