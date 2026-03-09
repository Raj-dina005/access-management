const pool = require('./db');

const createTables = async () => {
  try {
    // Users table (login accounts)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'security_staff', 'employee')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Employees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        department VARCHAR(100),
        designation VARCHAR(100),
        phone VARCHAR(20),
        employee_code VARCHAR(50) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Visitors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        purpose VARCHAR(255),
        host_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        pass_code VARCHAR(20) UNIQUE NOT NULL,
        valid_from TIMESTAMP NOT NULL,
        valid_until TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used')),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Access logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        person_type VARCHAR(10) NOT NULL CHECK (person_type IN ('employee', 'visitor')),
        person_id UUID NOT NULL,
        person_name VARCHAR(100) NOT NULL,
        action VARCHAR(10) NOT NULL CHECK (action IN ('entry', 'exit')),
        location VARCHAR(100) DEFAULT 'Main Gate',
        logged_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ All tables created successfully!');
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
  }
};

module.exports = createTables;
