/**
 * Migration script to import JSON data into MariaDB
 * Run with: npm run migrate
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// Read environment variables
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.MARIADB_HOST || 'db',
  user: process.env.MARIADB_USER || 'eprovider_user',
  password: process.env.MARIADB_PASSWORD || 'EproviderKompVika2026!',
  database: process.env.MARIADB_DATABASE || 'eprovider',
  port: process.env.MARIADB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✓ Connected to MariaDB');
});

// Read JSON file
const jsonPath = path.join(__dirname, '../frontend/app/competence_risk_bundle (6).json');
let jsonData;

try {
  const fileContent = fs.readFileSync(jsonPath, 'utf8');
  jsonData = JSON.parse(fileContent);
  console.log('✓ JSON file loaded');
} catch (err) {
  console.error('❌ Failed to read JSON:', err);
  process.exit(1);
}

const { db: data } = jsonData;

// Counters
let counts = {
  employees: 0,
  systems: 0,
  services: 0
};

// Helper: Run query with promise
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Main migration
async function migrate() {
  try {
    console.log('\n📊 Starting data migration...\n');

    // Clear existing data (optional - commented out for safety)
    // await query('TRUNCATE TABLE qualifications');
    // await query('TRUNCATE TABLE access_reviews');
    // await query('TRUNCATE TABLE service_required_systems');
    // await query('TRUNCATE TABLE actions');
    // await query('TRUNCATE TABLE employees');
    // await query('TRUNCATE TABLE systems');
    // await query('TRUNCATE TABLE services');

    // 1. Import Employees
    console.log('Importing employees...');
    if (data.employees && Array.isArray(data.employees)) {
      for (const emp of data.employees) {
        const sql = `
          INSERT IGNORE INTO employees 
          (employee_code, full_name, department, availability_percent)
          VALUES (?, ?, ?, ?)
        `;
        await query(sql, [
          emp.id || null,
          emp.name || 'Unknown',
          emp.dept || 'Unassigned',
          emp.avl || 100
        ]);
        counts.employees++;
      }
      console.log(`  ✓ Imported ${counts.employees} employees`);
    }

    // 2. Import Systems
    console.log('Importing systems...');
    if (data.systems && Array.isArray(data.systems)) {
      for (const sys of data.systems) {
        const sql = `
          INSERT IGNORE INTO systems 
          (system_code, name, environment, sensitivity)
          VALUES (?, ?, ?, ?)
        `;
        
        const environment = sys.env === 'Prod' ? 'PROD' : (sys.env || 'PROD');
        const sensitivity = sys.sensitivity === 'Internal' ? 'MEDIUM' : (sys.sensitivity || 'MEDIUM');
        
        await query(sql, [
          sys.id,
          sys.name,
          environment,
          sensitivity
        ]);
        counts.systems++;
      }
      console.log(`  ✓ Imported ${counts.systems} systems`);
    }

    // 3. Import Services (if available in JSON)
    console.log('Importing services...');
    if (data.services && Array.isArray(data.services)) {
      for (const svc of data.services) {
        const sql = `
          INSERT IGNORE INTO services 
          (service_code, name, criticality)
          VALUES (?, ?, ?)
        `;
        await query(sql, [
          svc.id || null,
          svc.name || 'Service',
          svc.criticality || 'MEDIUM'
        ]);
        counts.services++;
      }
      console.log(`  ✓ Imported ${counts.services} services`);
    }

    // 4. Import Matrix Data (Qualifications)
    console.log('Importing qualifications from matrix...');
    if (data.matrix && typeof data.matrix === 'object') {
      let qualCount = 0;
      
      // data.matrix is expected to be: { [systemId]: { [empId]: score } }
      for (const [sysCode, employees] of Object.entries(data.matrix)) {
        // Get system ID
        const sysResult = await query('SELECT id FROM systems WHERE system_code = ? LIMIT 1', [sysCode]);
        if (sysResult.length === 0) continue;
        const systemId = sysResult[0].id;

        for (const [empCode, qualData] of Object.entries(employees)) {
          // Get employee ID
          const empResult = await query('SELECT id FROM employees WHERE employee_code = ? LIMIT 1', [empCode]);
          if (empResult.length === 0) continue;
          const employeeId = empResult[0].id;

          // Insert qualification
          const score = typeof qualData === 'number' ? qualData : (qualData.total || 0);
          const sql = `
            INSERT INTO qualifications 
            (employee_id, system_id, total_score, qualification_level)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            total_score = ?,
            qualification_level = ?
          `;

          let level = 'NONE';
          if (score >= 14) level = 'EXPERT';
          else if (score >= 10) level = 'FULLY_CAPABLE';
          else if (score >= 5) level = 'QUALIFIED';
          else if (score >= 1) level = 'BASIC';

          await query(sql, [employeeId, systemId, score, level, score, level]);
          qualCount++;
        }
      }
      console.log(`  ✓ Imported ${qualCount} qualifications`);
    }

    console.log('\n✅ Migration complete!');
    console.log(`   - Employees: ${counts.employees}`);
    console.log(`   - Systems: ${counts.systems}`);
    console.log(`   - Services: ${counts.services}`);

    db.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Migration error:', err);
    db.end();
    process.exit(1);
  }
}

migrate();
