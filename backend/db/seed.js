const pool = require('./db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const existing = await pool.query(`SELECT * FROM users WHERE email = 'admin@access.com'`);
    if (existing.rows.length > 0) {
      console.log('ℹ️  Super admin already exists, skipping seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
    `, ['Super Admin', 'admin@access.com', hashedPassword, 'super_admin']);

    console.log('✅ Default super admin created!');
    console.log('   Email:    admin@access.com');
    console.log('   Password: Admin@123');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

module.exports = seedAdmin;
