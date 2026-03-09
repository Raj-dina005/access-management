const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/employees
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM employees ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM employees WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Employee not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/employees - admin and security staff
router.post('/', verifyToken, requireRole('super_admin', 'security_staff'), async (req, res) => {
  const { name, email, department, designation, phone, employee_code } = req.body;
  if (!name || !employee_code)
    return res.status(400).json({ message: 'Name and employee code are required.' });

  try {
    const result = await pool.query(
      `INSERT INTO employees (name, email, department, designation, phone, employee_code)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email, department, designation, phone, employee_code]
    );
    res.status(201).json({ message: 'Employee registered.', employee: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Employee code or email already exists.' });
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/employees/:id
router.put('/:id', verifyToken, requireRole('super_admin', 'security_staff'), async (req, res) => {
  const { name, email, department, designation, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE employees SET name=$1, email=$2, department=$3, designation=$4, phone=$5 WHERE id=$6 RETURNING *`,
      [name, email, department, designation, phone, req.params.id]
    );
    res.json({ message: 'Employee updated.', employee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/employees/:id (admin only)
router.delete('/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM employees WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Employee deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
