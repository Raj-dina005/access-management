const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/logs - get all logs with optional filters
router.get('/', verifyToken, async (req, res) => {
  try {
    const { person_type, action, date, search } = req.query;
    let query = `SELECT * FROM access_logs WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (person_type) { query += ` AND person_type = $${idx++}`; params.push(person_type); }
    if (action) { query += ` AND action = $${idx++}`; params.push(action); }
    if (date) { query += ` AND DATE(created_at) = $${idx++}`; params.push(date); }
    if (search) { query += ` AND person_name ILIKE $${idx++}`; params.push(`%${search}%`); }

    query += ` ORDER BY created_at DESC LIMIT 200`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/logs - log entry/exit
router.post('/', verifyToken, requireRole('super_admin', 'security_staff'), async (req, res) => {
  const { person_type, person_id, person_name, action, location } = req.body;
  if (!person_type || !person_id || !person_name || !action)
    return res.status(400).json({ message: 'All fields required.' });

  try {
    const result = await pool.query(
      `INSERT INTO access_logs (person_type, person_id, person_name, action, location, logged_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [person_type, person_id, person_name, action, location || 'Main Gate', req.user.id]
    );
    res.status(201).json({ message: 'Access log recorded.', log: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/logs/inside - who is currently inside
router.get('/inside', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (person_id) person_id, person_name, person_type, action, location, created_at
      FROM access_logs
      ORDER BY person_id, created_at DESC
    `);
    const inside = result.rows.filter(r => r.action === 'entry');
    res.json(inside);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/logs/stats - dashboard stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalEmployees, totalVisitors, todayEntries, currentlyInside] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM employees WHERE is_active = true`),
      pool.query(`SELECT COUNT(*) FROM visitors WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) FROM access_logs WHERE DATE(created_at) = $1 AND action = 'entry'`, [today]),
      pool.query(`
        SELECT COUNT(*) FROM (
          SELECT DISTINCT ON (person_id) person_id, action
          FROM access_logs ORDER BY person_id, created_at DESC
        ) sub WHERE action = 'entry'
      `)
    ]);

    res.json({
      total_employees: parseInt(totalEmployees.rows[0].count),
      active_visitors: parseInt(totalVisitors.rows[0].count),
      today_entries: parseInt(todayEntries.rows[0].count),
      currently_inside: parseInt(currentlyInside.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
